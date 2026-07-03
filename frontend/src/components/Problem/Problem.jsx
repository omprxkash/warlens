import React from 'react';
import './Problem.css';

const STATS = [
  {
    value: '93.4%',
    label: 'Ensemble accuracy on held-out set',
  },
  {
    value: '5',
    label: 'Triage categories with confidence-scaled severity',
  },
  {
    value: '2',
    label: 'CNN backbones (ResNet50 + MobileNetV2) with Grad-CAM',
  },
];

function Problem() {
  return (
    <section id="problem" className="problem">
      <div className="container">
        <div className="problem-head">
          <span className="problem-eyebrow">The problem</span>
          <h2 className="problem-title">What WarLens does</h2>
        </div>

        <div className="problem-body">
          <p className="problem-para">
            Aid organisations and conflict journalists process thousands of images a day — from social media, drone overflights, and field workers. Most of that human time goes into sorting: <em>is this combat, a fire, civilian aid in progress, or just noise?</em> WarLens does the boring half of that loop so people can focus on the hard cases.
          </p>
          <p className="problem-para">
            For each image it returns a category, a confidence-scaled severity score, a suggested humanitarian response cluster, and a Grad-CAM heatmap showing what the model actually looked at — so a human reviewer can decide whether to trust it.
          </p>
        </div>

        <div className="problem-stats">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Problem;
