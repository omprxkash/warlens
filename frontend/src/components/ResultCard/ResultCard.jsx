import React, { useRef, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './ResultCard.css';

function getConfidenceValue(confidenceStr) {
  return parseFloat(String(confidenceStr || '').replace('%', '')) || 0;
}

function getConfidenceTone(value) {
  if (value >= 80) return 'high';
  if (value >= 55) return 'medium';
  return 'low';
}

function SeverityDots({ score }) {
  const clamped = Math.max(0, Math.min(5, Number(score) || 0));
  return (
    <div className="sev-dots" aria-label={`Severity ${clamped} out of 5`}>
      <div className="sev-dots-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`sev-dot ${n <= clamped ? 'is-filled' : ''}`} />
        ))}
        <span className="sev-dots-label">{clamped} / 5</span>
      </div>
    </div>
  );
}

async function downloadReport(node, filename) {
  if (!node) return;
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(node, { backgroundColor: '#ffffff', scale: 2 });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

const CLUSTER_TONES = ['cluster-blue', 'cluster-violet', 'cluster-amber', 'cluster-green', 'cluster-pink'];
const SESSION_KEY = 'warlens_last_result';

function ClassBreakdown({ allProbs, winner }) {
  const sorted = Object.entries(allProbs).sort(([, a], [, b]) => b - a);
  return (
    <section className="result-tile result-tile-row">
      <div className="result-tile-label">Class Probabilities</div>
      <div className="prob-breakdown">
        {sorted.map(([label, prob]) => {
          const pct = (prob * 100).toFixed(1);
          const isWinner = label === winner;
          return (
            <div key={label} className={`prob-row${isWinner ? ' prob-row-winner' : ''}`}>
              <span className="prob-label">{label}</span>
              <div className="prob-track" aria-hidden="true">
                <div className="prob-fill" style={{ width: `${Math.min(100, prob * 100)}%` }} />
              </div>
              <span className="prob-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ResultCard() {
  const location = useLocation();
  const cardRef = useRef(null);

  const result = useMemo(() => {
    const fromNav = location.state?.data;
    if (fromNav) {
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(fromNav)); } catch {}
      return fromNav;
    }
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  if (!result) {
    return (
      <div className="result-card result-card-empty">
        <span className="eyebrow">No result</span>
        <h1 className="result-empty-title">Nothing to show yet.</h1>
        <p className="result-empty-sub">
          Upload an image to get a triage classification.
        </p>
        <Link to="/upload" className="btn btn-primary">Analyze an image</Link>
      </div>
    );
  }

  if (result.category === 'Uncertain') {
    return (
      <div className="result-card result-card-uncertain">
        <span className="result-uncertain-mark" aria-hidden="true">?</span>
        <span className="eyebrow result-uncertain-eyebrow">Low confidence</span>
        <h1 className="result-uncertain-title">Couldn&rsquo;t classify this image.</h1>
        <p className="result-uncertain-sub">
          {result.message || 'The image doesn’t clearly match a known conflict-event category. Try another with a clearer subject.'}
        </p>
        <div className="result-uncertain-meta">
          <span>Model confidence</span>
          <strong>{result.confidence}</strong>
        </div>
        <Link to="/upload" className="btn btn-primary">Try a different image</Link>
      </div>
    );
  }

  const confidence = getConfidenceValue(result.confidence);
  const tone = getConfidenceTone(confidence);

  return (
    <>
      <h1 className="results-title">Analysis Results</h1>

      <div className="result-card" ref={cardRef}>
        <div className="result-row result-row-two">
          <section className="result-tile">
            <div className="result-tile-label">Category</div>
            <div className="result-tile-value">{result.category}</div>
          </section>

          <section className="result-tile">
            <div className="result-tile-label">Confidence</div>
            <div className="result-tile-value">{result.confidence}</div>
            <div className="conf-track" aria-hidden="true">
              <div
                className={`conf-fill tone-${tone}`}
                style={{ width: `${Math.max(0, Math.min(100, confidence))}%` }}
              />
            </div>
          </section>
        </div>

        {result.all_probs && Object.keys(result.all_probs).length > 0 && (
          <ClassBreakdown allProbs={result.all_probs} winner={result.category} />
        )}

        <section className="result-tile result-tile-row">
          <div className="result-tile-label">Severity</div>
          <SeverityDots score={result.severity_score} />
          <p className="result-tile-caption">
            Base risk for this category scaled by model confidence. 1 = low, 5 = critical.
          </p>
        </section>

        {Array.isArray(result.response_clusters) && result.response_clusters.length > 0 && (
          <section className="result-tile result-tile-row">
            <div className="result-tile-label">Suggested Response Clusters</div>
            <div className="clusters-grid">
              {result.response_clusters.map((c, idx) => (
                <div key={c.cluster} className={`cluster ${CLUSTER_TONES[idx % CLUSTER_TONES.length]}`}>
                  <div className="cluster-name">{c.cluster}</div>
                  <ul className="cluster-actions">
                    {c.actions.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p className="result-tile-caption">
              Indicative response framework based on UN OCHA cluster vocabulary. Real aid sizing requires field assessment.
            </p>
          </section>
        )}

        {result.gradcam_image && (
          <section className="result-tile result-tile-row result-tile-gradcam">
            <div className="result-tile-label">Model Attention Heatmap</div>
            <p className="result-tile-desc">
              Highlighted regions show which parts of the image most influenced the classification. Warm colours (red/yellow) indicate high model attention.
            </p>
            <div className="gradcam-frame">
              <img
                src={`data:image/png;base64,${result.gradcam_image}`}
                alt="Grad-CAM attention heatmap"
              />
            </div>
          </section>
        )}
      </div>

      <div className="result-actions">
        <Link to="/upload" className="btn btn-ghost result-action">Analyze another image</Link>
        <button
          type="button"
          className="btn btn-accent result-action"
          onClick={() => downloadReport(
            cardRef.current,
            `warlens-${(result.category || 'result').toLowerCase().replace(/\s+/g, '-')}.png`,
          )}
        >
          Download Report
        </button>
      </div>
    </>
  );
}

export default ResultCard;
