import os
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.environ.get('WARLENS_DATASET_DIR', os.path.join(SCRIPT_DIR, '..', 'dataset'))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, 'war_lens_resnet50.h5')
SEED = 42

num_classes = 5

base_model = ResNet50(include_top=False, weights='imagenet', input_shape=(224, 224, 3))

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(1024, activation='relu')(x)
predictions = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

for layer in base_model.layers:
    layer.trainable = False

model.compile(optimizer=Adam(learning_rate=0.0001), loss='categorical_crossentropy', metrics=['accuracy'])

train_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

train_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='training',
    seed=SEED,
)

validation_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='validation',
    seed=SEED,
)

model.fit(train_generator, validation_data=validation_generator, epochs=10)

model.save(OUTPUT_PATH)
print(f"Saved model to {OUTPUT_PATH}")
