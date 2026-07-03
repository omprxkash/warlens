import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SampleStrip.css';

const PUBLIC_URL = process.env.PUBLIC_URL || '';

const SAMPLES = [
  { file: 'combat.jpg', label: 'Combat' },
  { file: 'destroyed-buildings.jpg', label: 'Destroyed Buildings' },
  { file: 'fire.jpg', label: 'Fire' },
  { file: 'humanitarian-aid.jpg', label: 'Humanitarian Aid' },
  { file: 'military-vehicles.jpg', label: 'Military Vehicles & Weapons' },
];

function SampleStrip() {
  const navigate = useNavigate();

  const handlePick = (sample) => {
    navigate('/upload', { state: { sample: `${PUBLIC_URL}/samples/${sample.file}`, sampleName: sample.file } });
  };

  return (
    <section className="samples">
      <div className="container">
        <div className="samples-head">
          <span className="eyebrow">Try a sample</span>
          <h2 className="samples-title">Don&rsquo;t have an image handy? Start with one of ours.</h2>
          <p className="samples-sub">
            Each sample covers a different response category the ensemble was trained on.
          </p>
        </div>

        <div className="samples-grid">
          {SAMPLES.map((sample) => (
            <button
              key={sample.file}
              type="button"
              className="sample-card"
              onClick={() => handlePick(sample)}
              aria-label={`Analyze sample image: ${sample.label}`}
            >
              <span className="sample-thumb">
                <img src={`${PUBLIC_URL}/samples/${sample.file}`} alt="" loading="lazy" />
              </span>
              <span className="sample-meta">
                <span className="sample-label">{sample.label}</span>
                <span className="sample-cta" aria-hidden="true">Analyze →</span>
              </span>
            </button>
          ))}
        </div>

        <div className="samples-footer">
          <Link to="/gallery" className="samples-browse">
            Browse all 100 dataset images <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SampleStrip;
