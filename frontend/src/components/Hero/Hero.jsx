import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <span className="hero-pill">
          <span className="hero-pill-dot" aria-hidden="true" />
          ResNet50 + MobileNetV2 ensemble · live
        </span>
        <h1 className="hero-title">
          Triage conflict imagery in <em>seconds</em>, not hours.
        </h1>
        <p className="hero-sub">
          WarLens classifies a war-zone photograph into one of five response categories and reports the model&rsquo;s confidence — a quick first pass for analysts, journalists, and humanitarian researchers.
        </p>
        <div className="hero-actions">
          <Link to="/upload" className="btn btn-primary hero-cta">
            Analyze an image
            <span aria-hidden="true" className="hero-cta-arrow">→</span>
          </Link>
          <a className="btn btn-ghost hero-cta" href="#how-it-works">
            How it works
          </a>
        </div>
        <div className="hero-meta">
          <span className="hero-meta-item">5 response categories</span>
          <span className="hero-meta-dot" aria-hidden="true">·</span>
          <span className="hero-meta-item">JPG &amp; PNG up to 16 MB</span>
          <span className="hero-meta-dot" aria-hidden="true">·</span>
          <span className="hero-meta-item">No image stored</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
