import React, { useState, useEffect } from 'react';
import {
  Sparkles, AlertTriangle, ShieldCheck, GitCommit, Network,
  Search, ArrowRight, MapPin, CheckCircle2
} from 'lucide-react';
import DiscrepancyDetailWorkspace from './DiscrepancyDetailWorkspace';
import {
  getDiscrepancyClusters,
  getDiscrepancies,
  getDiscrepancyDossier
} from '../../services/discrepancyIntelligenceService';

export default function DiscrepancyIntelligenceView({
  initialDiscrepancyId = null,
  onNavigateToParcel = () => {},
  addToast = () => {}
}) {
  const [clusters, setClusters] = useState(() => getDiscrepancyClusters());
  const [discrepancies, setDiscrepancies] = useState(() => getDiscrepancies());
  const [selectedDiscrepancyId, setSelectedDiscrepancyId] = useState(initialDiscrepancyId);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setClusters(getDiscrepancyClusters());
    setDiscrepancies(getDiscrepancies());
  }, []);

  const handleSelectDiscrepancy = (id) => {
    setSelectedDiscrepancyId(id);
  };

  const handleBackToQueue = () => {
    setSelectedDiscrepancyId(null);
    setDiscrepancies(getDiscrepancies());
  };

  const handleDossierUpdated = (updated) => {
    setDiscrepancies(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  if (selectedDiscrepancyId) {
    const activeDossier = getDiscrepancyDossier(selectedDiscrepancyId);
    return (
      <DiscrepancyDetailWorkspace
        dossier={activeDossier}
        onBack={handleBackToQueue}
        onDossierUpdated={handleDossierUpdated}
        addToast={addToast}
      />
    );
  }

  const filteredDiscrepancies = discrepancies.filter(item => {
    const matchSeverity = activeSeverityFilter === 'ALL' || item.severity.toLowerCase() === activeSeverityFilter.toLowerCase();
    const matchSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetParcelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.village.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSeverity && matchSearch;
  });

  return (
    <div className="clean-intel-root">
      {/* 1. Sleek Compact Header */}
      <div className="clean-intel-header">
        <div className="cih-left">
          <div className="cih-eyebrow">
            <Sparkles size={13} className="text-emerald" />
            <span>AI Forensic Decision Engine</span>
          </div>
          <h2 className="cih-title">⭐ Discrepancy Intelligence</h2>
          <p className="cih-sub">Causal & dependency intelligence mapping Possible Common Sources and Downstream Risk.</p>
        </div>

        {/* Minimalist KPI Strip */}
        <div className="cih-kpi-strip">
          <div className="cih-kpi red">
            <span className="cih-kpi-num">3</span>
            <span className="cih-kpi-lbl">Prioritized Contradictions</span>
          </div>
          <div className="cih-kpi amber">
            <span className="cih-kpi-num">3</span>
            <span className="cih-kpi-lbl">Inferred Clusters</span>
          </div>
          <div className="cih-kpi green">
            <span className="cih-kpi-num">13.45 Ac</span>
            <span className="cih-kpi-lbl">Potential Exposure</span>
          </div>
        </div>
      </div>

      {/* 2. Streamlined Cluster Cards */}
      <div className="clean-cluster-grid">
        {clusters.map((c) => (
          <div 
            key={c.id} 
            className={`clean-cluster-card ${c.severity.toLowerCase()}`}
            onClick={() => handleSelectDiscrepancy(c.primaryDiscrepancyId)}
          >
            <div className="ccc-top">
              <span className="ccc-type">{c.discrepancyType}</span>
              <span className={`ccc-sev ${c.severity.toLowerCase()}`}>{c.severity}</span>
            </div>
            <h4 className="ccc-title">{c.name}</h4>
            <span className="ccc-src">Source: <b>{c.possibleCommonSource}</b></span>
            <div className="ccc-footer">
              <span className="ccc-stats">{c.affectedParcelsCount} Parcels · {c.totalAcreageExposure}</span>
              <span className="ccc-cta">Investigate →</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Prioritized Queue */}
      <div className="clean-queue-wrap">
        <div className="clean-queue-toolbar">
          <div className="cqt-filters">
            <button 
              className={`cqt-pill ${activeSeverityFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveSeverityFilter('ALL')}
            >
              All ({discrepancies.length})
            </button>
            <button 
              className={`cqt-pill red ${activeSeverityFilter === 'Critical' ? 'active' : ''}`}
              onClick={() => setActiveSeverityFilter('Critical')}
            >
              Critical (1)
            </button>
            <button 
              className={`cqt-pill amber ${activeSeverityFilter === 'High' ? 'active' : ''}`}
              onClick={() => setActiveSeverityFilter('High')}
            >
              High Priority (1)
            </button>
            <button 
              className={`cqt-pill blue ${activeSeverityFilter === 'Medium' ? 'active' : ''}`}
              onClick={() => setActiveSeverityFilter('Medium')}
            >
              Medium (1)
            </button>
          </div>

          <div className="cqt-search">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Filter survey no, village, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* High-Density Clean Queue Cards */}
        <div className="clean-queue-list">
          {filteredDiscrepancies.map((item) => (
            <div 
              key={item.id}
              className={`clean-queue-row ${item.severity.toLowerCase()}`}
              onClick={() => handleSelectDiscrepancy(item.id)}
            >
              <div className="cqr-left">
                <div className="cqr-id-col">
                  <span className="cqr-id mono font-bold">{item.targetParcelId}</span>
                  <span className="cqr-survey mono">Survey {item.surveyNumber}</span>
                </div>
                <div className="cqr-info-col">
                  <div className="cqr-title-row">
                    <span className="cqr-title">{item.title}</span>
                    <span className={`cqr-sev ${item.severity.toLowerCase()}`}>{item.severity}</span>
                  </div>
                  <span className="cqr-sub">{item.village}, {item.taluk} · Possible Source: {item.possibleCommonSourceGraph?.nodes?.find(n => n.isHighlight)?.label || '2017 Revenue Ingestion'}</span>
                </div>
              </div>

              <div className="cqr-right">
                <div className="cqr-stat">
                  <span className="cqr-stat-val font-bold">{item.empiricalSummary?.financialExposure || '₹72L'}</span>
                  <span className="cqr-stat-lbl">Exposure</span>
                </div>
                <button className="btn-clean-investigate">
                  <span>Investigate</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
