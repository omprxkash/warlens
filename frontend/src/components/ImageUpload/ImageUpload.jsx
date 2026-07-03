import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useLocation } from 'react-router-dom';
import { uploadImage, normalizeError, checkHealth } from '../../api/upload';
import './ImageUpload.css';

const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
const ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendUp, setBackendUp] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;
    checkHealth().then((ok) => {
      if (!cancelled) setBackendUp(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    const samplePath = location.state?.sample;
    const sampleName = location.state?.sampleName;
    if (!samplePath || file) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(samplePath);
        if (!res.ok) throw new Error(`Failed to load sample (${res.status})`);
        const blob = await res.blob();
        if (cancelled) return;
        const sampleFile = new File([blob], sampleName || 'sample.jpg', { type: blob.type || 'image/jpeg' });
        setFile(sampleFile);
        setPreview(samplePath);
      } catch (err) {
        if (!cancelled) setError('Could not load that sample image. Try picking your own.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.state, file]);

  const onDrop = useCallback((accepted, rejected) => {
    setError(null);
    if (rejected && rejected.length > 0) {
      const reason = rejected[0]?.errors?.[0]?.code;
      if (reason === 'file-too-large') {
        setError('That image is over 16 MB. Please pick a smaller file.');
      } else if (reason === 'file-invalid-type') {
        setError('Only JPG and PNG images are supported.');
      } else {
        setError('That file could not be used. Try a JPG or PNG under 16 MB.');
      }
      return;
    }
    const dropped = accepted[0];
    if (!dropped) return;
    setPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(dropped);
    });
    setFile(dropped);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_UPLOAD_BYTES,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await uploadImage(file);
      navigate('/result', { state: { data } });
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const sizeKb = file ? Math.round(file.size / 1024) : 0;
  const sizeLabel = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

  return (
    <div className="upload-card">
      <header className="upload-card-head">
        <span className="eyebrow">Analyze</span>
        <h1 className="upload-card-title">Upload a war-zone image</h1>
        <p className="upload-card-sub">
          JPG or PNG, up to 16 MB. The ensemble returns a category, severity, suggested response clusters, and a Grad-CAM heatmap.
        </p>
      </header>

      {backendUp === false && (
        <div className="upload-warn" role="status">
          <span className="upload-warn-dot" aria-hidden="true" />
          <span>
            Analysis server is offline or waking up. The first request after idle can take 20–30 s on the free Hugging Face Space — give it a moment.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          {...getRootProps({
            className: `dropzone ${isDragActive ? 'is-active' : ''} ${preview ? 'has-preview' : ''}`,
          })}
        >
          <input {...getInputProps()} />

          {preview ? (
            <div className="dropzone-preview">
              <img src={preview} alt="Selected upload" />
              <div className="dropzone-preview-meta">
                <div className="dropzone-preview-name">{file?.name}</div>
                <div className="dropzone-preview-size">{sizeLabel}</div>
              </div>
            </div>
          ) : (
            <div className="dropzone-empty">
              <div className="dropzone-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="dropzone-headline">
                {isDragActive ? 'Drop the image to analyze' : 'Drag an image here'}
              </p>
              <p className="dropzone-helptext">
                or <button type="button" className="dropzone-link" onClick={open}>browse from your device</button>
              </p>
              <p className="dropzone-formats">JPG · PNG · 16 MB max</p>
            </div>
          )}
        </div>

        {error && (
          <div className="upload-error" role="alert">
            <span className="upload-error-dot" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="upload-actions">
          {preview && (
            <button type="button" className="btn btn-ghost" onClick={handleClear} disabled={loading}>
              Clear
            </button>
          )}
          <button type="submit" className="btn btn-primary upload-submit" disabled={!file || loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Analyzing&hellip;
              </>
            ) : (
              <>
                Run analysis
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ImageUpload;
