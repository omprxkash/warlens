import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, DATASET, DATASET_TOTAL, TRAINING_TOTAL } from '../../data/datasetIndex';
import './DatasetGallery.css';

function DatasetGallery() {
  const [active, setActive] = useState('All');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (active === 'All') return DATASET;
    return DATASET.filter((item) => item.category === active);
  }, [active]);

  const handlePick = (item) => {
    navigate('/upload', {
      state: { sample: item.url, sampleName: item.file },
    });
  };

  return (
    <section className="dataset-gallery">
      <div className="container">
        <header className="dataset-head">
          <span className="eyebrow dataset-eyebrow">Training set</span>
          <h1 className="dataset-title">Browse the dataset</h1>
          <p className="dataset-sub">
            A sampled slice of the 500-image training set the ensemble learned on. Pick any image to send it through the analyzer.
          </p>
          <p className="dataset-count">
            Showing <strong>{DATASET_TOTAL}</strong> of {TRAINING_TOTAL} images across {CATEGORIES.length} categories.
          </p>
        </header>

        <div className="dataset-filters" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            role="tab"
            aria-selected={active === 'All'}
            className={`dataset-filter ${active === 'All' ? 'is-active' : ''}`}
            onClick={() => setActive('All')}
          >
            All
            <span className="dataset-filter-count">{DATASET_TOTAL}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = DATASET.filter((d) => d.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active === cat.id}
                className={`dataset-filter ${active === cat.id ? 'is-active' : ''}`}
                onClick={() => setActive(cat.id)}
              >
                {cat.label}
                <span className="dataset-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="dataset-grid">
          {filtered.map((item) => (
            <button
              key={`${item.category}/${item.file}`}
              type="button"
              className="dataset-card"
              onClick={() => handlePick(item)}
              title={`Analyze ${item.file} (${item.label})`}
              aria-label={`Analyze sample image ${item.file} from ${item.label}`}
            >
              <span className="dataset-thumb">
                <img src={item.url} alt="" loading="lazy" />
              </span>
              <span className="dataset-meta">
                <span className="dataset-meta-cat">{item.label}</span>
                <span className="dataset-meta-cta" aria-hidden="true">Analyze →</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DatasetGallery;
