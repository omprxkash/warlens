import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-col-brand">
            <h4 className="footer-heading">WarLens</h4>
            <p className="footer-blurb">
              An image-triage demo for conflict-zone reporting. Trained on a 500-image dataset. Open source under the MIT license.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Navigate</h4>
            <ul className="footer-list">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/gallery" className="footer-link">Browse the dataset</Link></li>
              <li><Link to="/upload" className="footer-link">Analyze an image</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Project</h4>
            <ul className="footer-list">
              <li>
                <a
                  className="footer-link"
                  href="https://github.com/omprxkash/warlens"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Source on GitHub
                </a>
              </li>
              <li>
                <a
                  className="footer-link"
                  href="https://github.com/omprxkash/warlens#readme"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  README &amp; roadmap
                </a>
              </li>
              <li>
                <a
                  className="footer-link"
                  href="https://ieeexplore.ieee.org/document/11040802"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Paper
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">About the build</h4>
            <p className="footer-blurb">
              React 18 + Flask + TensorFlow 2.x ensemble (ResNet50 + MobileNetV2) with Grad-CAM explainability. Frontend served from GitHub Pages, backend on a free Hugging Face Space — which sleeps when idle, so the first request can take 20–30 s.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; 2026 WarLens. Released under the MIT license. Not for operational use without field validation.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
