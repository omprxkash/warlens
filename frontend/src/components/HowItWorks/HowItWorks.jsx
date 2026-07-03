import React from 'react';
import './HowItWorks.css';

const ICONS = {
  upload: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 30h20" />
      <path d="M14 30v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8" />
      <path d="M24 8v22" />
      <polyline points="14,18 24,8 34,18" />
    </svg>
  ),
  chip: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="13" y="13" width="22" height="22" rx="3" />
      <rect x="19" y="19" width="10" height="10" rx="1.5" />
      <line x1="19" y1="8" x2="19" y2="13" />
      <line x1="29" y1="8" x2="29" y2="13" />
      <line x1="19" y1="35" x2="19" y2="40" />
      <line x1="29" y1="35" x2="29" y2="40" />
      <line x1="8" y1="19" x2="13" y2="19" />
      <line x1="8" y1="29" x2="13" y2="29" />
      <line x1="35" y1="19" x2="40" y2="19" />
      <line x1="35" y1="29" x2="40" y2="29" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="11" y="26" width="6" height="14" rx="1" />
      <rect x="21" y="18" width="6" height="22" rx="1" />
      <rect x="31" y="22" width="6" height="18" rx="1" />
      <polyline points="13,18 22,11 30,17 38,8" />
      <circle cx="13" cy="18" r="1.5" fill="currentColor" />
      <circle cx="22" cy="11" r="1.5" fill="currentColor" />
      <circle cx="30" cy="17" r="1.5" fill="currentColor" />
      <circle cx="38" cy="8" r="1.5" fill="currentColor" />
    </svg>
  ),
};

const STEPS = [
  {
    icon: 'upload',
    title: 'Upload Image',
    body: 'Select or drag & drop your war-zone imagery.',
  },
  {
    icon: 'chip',
    title: 'AI Analysis',
    body: 'A ResNet50 + MobileNetV2 ensemble scores the image.',
  },
  {
    icon: 'chart',
    title: 'Get Results',
    body: 'Receive the predicted category and confidence score.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="how">
      <div className="container">
        <div className="how-head">
          <span className="how-eyebrow">Flow</span>
          <h2 className="how-title">How It Works</h2>
        </div>

        <div className="how-grid" role="list">
          <span className="how-line" aria-hidden="true" />
          {STEPS.map((step) => (
            <div key={step.title} role="listitem" className="how-step">
              <div className="how-step-icon">{ICONS[step.icon]}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-body">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
