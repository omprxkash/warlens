import os
import uuid
import base64
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tensorflow as tf
from tensorflow.keras.models import load_model, Model
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
from PIL import Image
import cv2

app = Flask(__name__)

cors_origins = os.environ.get('WARLENS_CORS_ORIGINS', '')
if cors_origins == '*':
    CORS(app)
elif cors_origins:
    CORS(app, origins=[o.strip() for o in cors_origins.split(',') if o.strip()])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
MODEL_DIR = os.environ.get('WARLENS_MODEL_DIR', os.path.join(PROJECT_ROOT, 'model'))

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MODEL_PATH_RESNET = os.path.join(MODEL_DIR, 'war_lens_resnet50.h5')
MODEL_PATH_MOBILENET = os.path.join(MODEL_DIR, 'war_lens_mobilenetv2.h5')
RESNET_LAST_CONV = 'conv5_block3_out'
CONFIDENCE_THRESHOLD = 0.55

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

model_resnet = None
model_mobilenet = None
_load_errors = {}

try:
    model_resnet = load_model(MODEL_PATH_RESNET)
    app.logger.info("ResNet50 model loaded.")
except Exception as e:
    _load_errors['resnet'] = str(e)
    app.logger.warning(f"ResNet50 load failed: {e}")

try:
    model_mobilenet = load_model(MODEL_PATH_MOBILENET)
    app.logger.info("MobileNetV2 model loaded.")
except Exception as e:
    _load_errors['mobilenet'] = str(e)
    app.logger.warning(f"MobileNetV2 not loaded, running single-model mode: {e}")

# Keras 3 traces the computation graph on first model call, which takes 30–60 s per
# model on CPU. Warm up both models now (during gunicorn --preload) so the first real
# request doesn't hit that cost.
_warmup = np.zeros((1, 224, 224, 3), dtype=np.float32)
if model_resnet is not None:
    try:
        model_resnet(resnet_preprocess(_warmup.copy()), training=False)
        app.logger.info("ResNet50 warmed up.")
    except Exception as e:
        app.logger.warning(f"ResNet50 warmup failed: {e}")
if model_mobilenet is not None:
    try:
        model_mobilenet(mobilenet_preprocess(_warmup.copy()), training=False)
        app.logger.info("MobileNetV2 warmed up.")
    except Exception as e:
        app.logger.warning(f"MobileNetV2 warmup failed: {e}")
del _warmup

# Cache the Grad-CAM sub-model once so we don't rebuild it per request.
_gradcam_model = None
if model_resnet is not None:
    try:
        _gradcam_model = Model(
            inputs=model_resnet.inputs,
            outputs=[model_resnet.get_layer(RESNET_LAST_CONV).output, model_resnet.output],
        )
        app.logger.info("Grad-CAM model cached.")
    except Exception as e:
        app.logger.warning(f"Grad-CAM model build failed: {e}")

# Index order matches Keras flow_from_directory alphabetical ordering of dataset/ folders.
CLASS_LABELS = {
    0: 'Combat',
    1: 'Destroyed Buildings',
    2: 'Fire',
    3: 'Humanitarian Aid',
    4: 'Military Vehicles & Weapons',
}

# Severity is a 1-5 base score, scaled by confidence in the response.
# Response clusters borrow the UN OCHA cluster vocabulary (Medical, Protection,
# Shelter, Search & Rescue, Logistics) so the framing is grounded rather than invented.
RESPONSE_PROFILES = {
    'Combat': {
        'severity_base': 5,
        'response_clusters': [
            ('Medical', ['Trauma care teams', 'Field surgery units']),
            ('Protection', ['Civilian evacuation', 'Safe-corridor coordination']),
        ],
    },
    'Destroyed Buildings': {
        'severity_base': 4,
        'response_clusters': [
            ('Search & Rescue', ['Urban SAR teams', 'Debris removal']),
            ('Shelter', ['Temporary housing', 'Tarpaulins and blankets']),
        ],
    },
    'Fire': {
        'severity_base': 3,
        'response_clusters': [
            ('Medical', ['Burn treatment', 'Smoke-inhalation care']),
            ('Logistics', ['Firefighting capacity', 'Water supply']),
        ],
    },
    'Humanitarian Aid': {
        'severity_base': 2,
        'response_clusters': [
            ('Logistics', ['Food and clean water', 'Last-mile distribution']),
            ('Shelter', ['Blankets', 'Hygiene kits']),
        ],
    },
    'Military Vehicles & Weapons': {
        'severity_base': 5,
        'response_clusters': [
            ('Protection', ['Civilian evacuation', 'Mine-risk education']),
            ('Search & Rescue', ['Ordnance disposal', 'Route clearance']),
        ],
    },
}


def compute_severity(base, confidence):
    """1-5 base score scaled by softmax confidence, clamped to 1-5."""
    return max(1, min(5, round(base * confidence)))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_image_array(image_path):
    img = Image.open(image_path).convert('RGB').resize((224, 224))
    return np.array(img, dtype=np.float32)


def generate_gradcam(img_array, grad_model, class_idx, preprocess_fn):
    """Compute Grad-CAM heatmap using a pre-built (cached) grad_model."""
    if grad_model is None:
        return None
    try:
        img_tensor = tf.cast(np.expand_dims(img_array, axis=0), tf.float32)
        preprocessed = preprocess_fn(img_tensor)

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(preprocessed)
            tape.watch(conv_outputs)
            loss = predictions[:, class_idx]

        grads = tape.gradient(loss, conv_outputs)
        if grads is None:
            return None

        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2)).numpy()
        conv_outputs_np = conv_outputs[0].numpy()
        for i in range(pooled_grads.shape[-1]):
            conv_outputs_np[:, :, i] *= pooled_grads[i]

        heatmap = np.mean(conv_outputs_np, axis=-1)
        heatmap = np.maximum(heatmap, 0)
        max_val = np.max(heatmap)
        if max_val > 0:
            heatmap /= max_val

        heatmap_resized = cv2.resize(heatmap, (224, 224))
        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        return cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    except Exception as e:
        app.logger.warning(f"Grad-CAM skipped: {e}")
        return None


def overlay_gradcam_on_image(image_path, heatmap, alpha=0.4):
    """Blend Grad-CAM heatmap onto original image and return as base64 PNG."""
    original = cv2.imread(image_path)
    original = cv2.resize(original, (224, 224))
    superimposed = cv2.addWeighted(original, 1 - alpha, heatmap, alpha, 0)
    _, buffer = cv2.imencode('.png', superimposed)
    return base64.b64encode(buffer).decode('utf-8')


def predict_ensemble(img_array):
    """Run prediction with ensemble (or single model fallback). Returns (class_idx, confidence, all_probs)."""
    resnet_input = resnet_preprocess(np.expand_dims(img_array.copy(), axis=0))
    pred_resnet = model_resnet(resnet_input, training=False).numpy()

    if model_mobilenet is not None:
        mobilenet_input = mobilenet_preprocess(np.expand_dims(img_array.copy(), axis=0))
        pred_mobilenet = model_mobilenet(mobilenet_input, training=False).numpy()
        ensemble = (pred_resnet + pred_mobilenet) / 2.0
    else:
        ensemble = pred_resnet

    class_idx = int(np.argmax(ensemble[0]))
    confidence = float(ensemble[0][class_idx])
    return class_idx, confidence, ensemble[0]


@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'service': 'WarLens API',
        'endpoints': ['/health', '/upload'],
    })


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'resnet_loaded': model_resnet is not None,
        'mobilenet_loaded': model_mobilenet is not None,
        'ensemble_active': model_resnet is not None and model_mobilenet is not None,
        'model_dir': MODEL_DIR,
        'resnet_path_exists': os.path.exists(MODEL_PATH_RESNET),
        'mobilenet_path_exists': os.path.exists(MODEL_PATH_MOBILENET),
        'load_errors': _load_errors,
    })


@app.route('/upload', methods=['POST'])
def upload_file():
    filepath = None
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        if model_resnet is None:
            return jsonify({'error': 'Model not loaded'}), 503

        # UUID prefix prevents concurrent uploads of the same filename from colliding.
        original = secure_filename(file.filename) or 'upload'
        ext = original.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
        file.save(filepath)

        img_array = load_image_array(filepath)
        class_idx, confidence, all_probs = predict_ensemble(img_array)
        all_probs_dict = {CLASS_LABELS[i]: round(float(all_probs[i]), 4) for i in range(len(CLASS_LABELS))}

        if confidence < CONFIDENCE_THRESHOLD:
            return jsonify({
                'category': 'Uncertain',
                'confidence': f"{confidence * 100:.2f}%",
                'message': 'Image does not clearly match a known conflict event category.',
                'gradcam_image': None,
                'all_probs': all_probs_dict,
            })

        predicted_class = CLASS_LABELS[class_idx]
        profile = RESPONSE_PROFILES[predicted_class]

        heatmap = generate_gradcam(img_array, _gradcam_model, class_idx, resnet_preprocess)
        gradcam_b64 = overlay_gradcam_on_image(filepath, heatmap) if heatmap is not None else None

        return jsonify({
            'category': predicted_class,
            'confidence': f"{confidence * 100:.2f}%",
            'severity_score': compute_severity(profile['severity_base'], confidence),
            'response_clusters': [
                {'cluster': name, 'actions': actions}
                for name, actions in profile['response_clusters']
            ],
            'gradcam_image': gradcam_b64,
            'all_probs': all_probs_dict,
        })

    except Exception:
        app.logger.exception('Unhandled error in /upload')
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                app.logger.warning(f"Could not remove temp upload {filepath}")


@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File is too large'}), 413


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', '0').lower() in ('1', 'true', 'yes')
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
