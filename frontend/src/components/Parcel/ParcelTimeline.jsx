import React from 'react';
import {
  Calendar, FileText, AlertTriangle, CheckCircle2, Eye, ShieldAlert,
  ArrowRight, GitCommit, ScrollText, Clock, ExternalLink, Sparkles
} from 'lucide-react';

export default function ParcelTimeline({
  timeline = [],
  onViewEvidence = () => {}
}) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="timeline-empty-state">
        <Clock size={24} className="text-muted" />
        <p>No historical mutation events recorded for this parcel.</p>
      </div>
    );
  }

  // Find divergence point event if any
  const divergenceEvent = timeline.find(e => e.isDivergence || e.status === 'DIVERGENCE');

  return (
    <div className="parcel-timeline-root">
      {/* Top Narrative Header */}
      <div className="timeline-narrative-header">
        <div className="narrative-left">
          <ScrollText size={18} className="text-emerald" />
          <h4 className="narrative-title">Ownership & Mutation Reconstruction Chain</h4>
        </div>
        <span className="narrative-count">{timeline.length} Historical Chronology Events</span>
      </div>

      {/* ===================================================================
          FIRST OBSERVED DIVERGENCE HIGHLIGHT BANNER
          =================================================================== */}
      {divergenceEvent && divergenceEvent.divergenceDetails && (
        <div className="divergence-highlight-banner">
          <div className="divergence-banner-top">
            <div className="divergence-badge-group">
              <span className="divergence-alert-pill">
                <AlertTriangle size={15} />
                <span>FIRST OBSERVED DIVERGENCE</span>
              </span>
              <span className="divergence-year-tag">Year {divergenceEvent.year}</span>
            </div>
            {divergenceEvent.evidenceId && (
              <button 
                className="btn-view-evidence-hero"
                onClick={() => onViewEvidence(divergenceEvent.evidenceId)}
              >
                <Eye size={15} />
                <span>View Evidence ({divergenceEvent.evidenceId}) →</span>
              </button>
            )}
          </div>

          <div className="divergence-comparison-grid">
            <div className="divergence-box expected">
              <span className="div-box-label">Expected Title Chain</span>
              <span className="div-box-val">{divergenceEvent.divergenceDetails.expected}</span>
              <span className="div-box-sub">Based on unbroken 1980–2008 ancestral lineage</span>
            </div>

            <div className="divergence-box source-a">
              <span className="div-box-label">Source A (Revenue Portal)</span>
              <span className="div-box-val">{divergenceEvent.divergenceDetails.sourceA}</span>
              <span className="div-box-sub">Form VII-B Mutation Register 2017</span>
            </div>

            <div className="divergence-box source-b">
              <span className="div-box-label">Source B (Registration Ledger)</span>
              <span className="div-box-val">{divergenceEvent.divergenceDetails.sourceB}</span>
              <span className="div-box-sub">Sub-Registrar Index II Encumbrance Archive</span>
            </div>
          </div>

          <div className="divergence-impact-row">
            <span className="impact-tag">AI Finding:</span>
            <span className="impact-text">{divergenceEvent.divergenceDetails.finding}</span>
          </div>
        </div>
      )}

      {/* ===================================================================
          CHRONOLOGICAL EVENT CARDS WITH TIMELINE CONNECTORS
          =================================================================== */}
      <div className="timeline-horizontal-track">
        {timeline.map((event, idx) => {
          const isDivergence = event.isDivergence || event.status === 'DIVERGENCE';
          const isVerified = event.status === 'VERIFIED';
          const isLast = idx === timeline.length - 1;

          return (
            <div 
              key={event.id || idx} 
              className={`timeline-event-card ${isDivergence ? 'event-divergence' : isVerified ? 'event-verified' : 'event-current'}`}
            >
              {/* Event Header */}
              <div className="event-top-bar">
                <div className="event-year-badge">
                  <Calendar size={13} />
                  <span>{event.year}</span>
                </div>
                <span className={`event-status-pill ${isDivergence ? 'red' : 'green'}`}>
                  {event.statusLabel || event.eventType}
                </span>
              </div>

              {/* Event Details */}
              <div className="event-body">
                <div className="event-title">{event.eventTitle || event.eventType}</div>
                
                <div className="event-field-row">
                  <span className="f-label">Title Holder:</span>
                  <span className={`f-val bold ${isDivergence ? 'text-red' : 'text-dark-green'}`}>
                    {event.owner}
                  </span>
                </div>

                <div className="event-field-row">
                  <span className="f-label">Source:</span>
                  <span className="f-val mono">{event.source}</span>
                </div>

                {event.docId && (
                  <div className="event-field-row">
                    <span className="f-label">Doc Ref:</span>
                    <span className="f-val mono">{event.docId}</span>
                  </div>
                )}

                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
              </div>

              {/* Action */}
              {event.evidenceId && (
                <div className="event-footer">
                  <button
                    className="btn-timeline-evidence"
                    onClick={() => onViewEvidence(event.evidenceId)}
                  >
                    <Eye size={13} />
                    <span>View Evidence →</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
