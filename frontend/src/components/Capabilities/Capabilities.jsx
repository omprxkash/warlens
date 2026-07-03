import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Capabilities.css';

const PUBLIC_URL = process.env.PUBLIC_URL || '';

const CAPABILITIES = [
  {
    n: '01',
    tone: 'indigo',
    title: 'Five-class triage',
    body: 'Combat, Destroyed Buildings, Fire, Humanitarian Aid, Military Vehicles & Weapons — the model returns the single most likely category with a confidence score.',
    cta: { label: 'Try a sample', kind: 'sample', sample: { file: 'combat.jpg', label: 'Combat' } },
  },
  {
    n: '02',
    tone: 'amber',
    title: 'Two-model ensemble',
    body: 'ResNet50 and MobileNetV2 score each image independently. Averaging their softmax probabilities is more robust than either model alone.',
    cta: { label: 'Read the source', kind: 'external', href: 'https://github.com/omprxkash/warlens' },
  },
  {
    n: '03',
    tone: 'green',
    title: 'Confidence reporting',
    body: 'Every classification ships with the model’s exact softmax probability — no hidden uncertainty, no rounded thresholds, no false certainty.',
    cta: { label: 'See an example', kind: 'sample', sample: { file: 'destroyed-buildings.jpg', label: 'Destroyed Buildings' } },
  },
  {
    n: '04',
    tone: 'plum',
    title: 'Honest refusals',
    body: 'Below 55 % confidence, WarLens refuses to guess and returns Uncertain instead. A deliberate refusal beats a confident wrong answer.',
    cta: { label: 'Upload your own', kind: 'route', to: '/upload' },
  },
];

function Capabilities() {
  const navigate = useNavigate();

  const handleCta = (cta) => {
    if (cta.kind === 'sample') {
      navigate('/upload', {
        state: {
          sample: `${PUBLIC_URL}/samples/${cta.sample.file}`,
          sampleName: cta.sample.file,
        },
      });
    } else if (cta.kind === 'route') {
      navigate(cta.to);
    }
  };

  return (
    <section id="capabilities" className="caps">
      <div className="container">
        <div className="caps-head">
          <span className="caps-eyebrow">Capabilities</span>
          <h2 className="caps-title">What WarLens actually does</h2>
          <p className="caps-sub">
            Four moving parts. Each one lines up with something a human reviewer would otherwise do by hand. Click any card to try that part of the flow.
          </p>
        </div>

        <div className="caps-grid">
          {CAPABILITIES.map((cap) => {
            const cardClass = `cap-card cap-${cap.tone}`;
            const inner = (
              <>
                <div className="cap-card-top">
                  <span className="cap-num">{cap.n}</span>
                  <span className="cap-line" aria-hidden="true" />
                </div>
                <h3 className="cap-card-title">{cap.title}</h3>
                <p className="cap-card-body">{cap.body}</p>
                <span className="cap-cta">
                  {cap.cta.label}
                  <span className="cap-cta-arrow" aria-hidden="true">→</span>
                </span>
              </>
            );

            if (cap.cta.kind === 'external') {
              return (
                <a
                  key={cap.n}
                  className={cardClass}
                  href={cap.cta.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {inner}
                </a>
              );
            }

            return (
              <button
                key={cap.n}
                type="button"
                className={cardClass}
                onClick={() => handleCta(cap.cta)}
              >
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Capabilities;
