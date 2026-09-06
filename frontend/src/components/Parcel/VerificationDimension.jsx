import React from 'react';
import {
  CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp,
  FileText, Shield, ArrowUpRight, TrendingDown, TrendingUp, Sparkles
} from 'lucide-react';

export default function VerificationDimension({
  id,
  title,
  status = 'VERIFIED',
  statusText = 'Verified',
  score = 85,
  explanation = '',
  evidenceCount = 0,
  details = [],
  isExpanded = false,
  onToggle = () => {},
  simulatedDiff = null,
  isSimulated = false,
  children
}) {
  const isContradiction = status === 'CONTRADICTION';
  const isReview = status === 'REVIEW';
  const isVerified = status === 'VERIFIED';

  const getStatusIcon = () => {
    if (isContradiction) return <AlertTriangle size={17} className="text-red" />;
    if (isReview) return <AlertCircle size={17} className="text-amber" />;
    return <CheckCircle2 size={17} className="text-emerald" />;
  };

  const getStatusClass = () => {
    if (isContradiction) return 'dimension-contradiction';
    if (isReview) return 'dimension-review';
    return 'dimension-verified';
  };

  return (
    <div className={`verification-dimension-card ${getStatusClass()} ${isExpanded ? 'expanded' : ''} ${isSimulated ? 'simulated-bar' : ''}`}>
      {/* Top Header Bar */}
      <div className="dimension-header" onClick={onToggle}>
        <div className="dimension-left">
          <div className="dimension-status-icon">
            {getStatusIcon()}
          </div>
          <div className="dimension-title-wrap">
            <div className="dimension-title-row">
              <span className="dimension-title">{title}</span>
              <span className={`dimension-badge ${status.toLowerCase()}`}>
                {statusText || (isContradiction ? 'Contradiction Detected' : isReview ? 'Needs Review' : 'Verified')}
              </span>
              {isSimulated && (
                <span className="simulated-tag">SIMULATED</span>
              )}
            </div>
            <p className="dimension-explanation">{explanation}</p>
          </div>
        </div>

        <div className="dimension-right">
          {/* Score / Meter */}
          <div className="dimension-score-block">
            <div className="score-num-row">
              <span className="score-val">{score}%</span>
              {simulatedDiff !== null && simulatedDiff !== 0 && (
                <span className={`diff-tag ${simulatedDiff > 0 ? 'positive' : 'negative'}`}>
                  {simulatedDiff > 0 ? `+${simulatedDiff}%` : `${simulatedDiff}%`}
                </span>
              )}
            </div>
            <div className="score-meter-track">
              <div 
                className={`score-meter-fill ${status.toLowerCase()}`} 
                style={{ width: `${Math.min(Math.max(score, 10), 100)}%` }}
              />
            </div>
          </div>

          {/* Evidence count pill */}
          {evidenceCount > 0 && (
            <div className="evidence-count-pill" title={`${evidenceCount} linked evidence records`}>
              <FileText size={13} />
              <span>{evidenceCount}</span>
            </div>
          )}

          {/* Accordion Expand Button */}
          <button 
            type="button" 
            className="dimension-toggle-btn"
            aria-label={isExpanded ? `Collapse ${title} details` : `Expand ${title} details`}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Accordion Body (Expanded State) */}
      {isExpanded && (
        <div className="dimension-expanded-content">
          {/* Bullet Breakdown Details */}
          {details && details.length > 0 && (
            <div className="dimension-details-list">
              <div className="details-heading">Verification Breakdown:</div>
              {details.map((detail, idx) => (
                <div key={idx} className="detail-bullet-row">
                  <span className="bullet-dot" />
                  <span className="bullet-text">{detail}</span>
                </div>
              ))}
            </div>
          )}

          {/* Optional Nested Children (e.g. Inline Timeline for Historical Dimension) */}
          {children && (
            <div className="dimension-nested-children">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
