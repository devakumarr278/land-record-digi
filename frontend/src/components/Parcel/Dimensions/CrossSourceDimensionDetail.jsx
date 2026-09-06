import React, { useState } from 'react';
import {
  Layers, AlertTriangle, CheckCircle2, ShieldAlert,
  GitCompare, RefreshCw, Send, Check, Building2
} from 'lucide-react';

export default function CrossSourceDimensionDetail({
  parcel,
  addToast = () => {}
}) {
  const [noticeDispatched, setNoticeDispatched] = useState(false);
  const [syncTriggered, setSyncTriggered] = useState(false);

  const registrySources = [
    {
      sourceName: 'Revenue Department e-Patta',
      tamilName: 'வருவாய்த்துறை இ-பட்டா பதிவேடு',
      authority: 'Taluk Office, Kinathukadavu (e-Sevai Portal)',
      owner: parcel?.currentOwner || 'Kannan',
      pattaNo: parcel?.pattaNumber || 'PTA-2017-4412',
      area: parcel?.area || '2.40 Acres',
      status: 'CONTRADICTION',
      statusLabel: 'Disputed Entry (2017)',
      lastUpdated: '19 Nov 2017',
      isDiscrepant: true
    },
    {
      sourceName: 'Registration Department Index II',
      tamilName: 'பதிவுத்துறை சுட்டெண் II பதிவேடு',
      authority: 'Sub-Registrar Office, Pollachi',
      owner: parcel?.historicalOwner || 'Ramasamy',
      pattaNo: 'Deed Vol 114 / Pg 22',
      area: '2.40 Acres',
      status: 'CONTRADICTION',
      statusLabel: 'Title Severed (No 2017 Deed)',
      lastUpdated: '22 Aug 1996',
      isDiscrepant: true
    },
    {
      sourceName: 'Survey & Settlement (CollabLand FMB)',
      tamilName: 'நில அளவை மற்றும் எல்லை வரைபடம்',
      authority: 'Central Cadastral Repository, Chennai',
      owner: 'Survey 124/2A Registered Polygon',
      pattaNo: 'FMB-KIN-124-2A',
      area: '2.40 Acres',
      status: 'VERIFIED',
      statusLabel: 'Boundary Concordant',
      lastUpdated: '15 Jan 2024',
      isDiscrepant: false
    },
    {
      sourceName: 'Banking & CERSAI Encumbrance Registry',
      tamilName: 'வங்கி அடமான மற்றும் வில்லங்க பதிவேடு',
      authority: 'CERSAI National Central Registry',
      owner: 'Clear (Nil Encumbrance)',
      pattaNo: 'NIL-CHARGE-2026',
      area: '2.40 Acres',
      status: 'VERIFIED',
      statusLabel: 'No Active Mortgage / Stay',
      lastUpdated: '01 Sep 2026',
      isDiscrepant: false
    }
  ];

  const handleDispatchNotice = () => {
    setNoticeDispatched(true);
    if (typeof addToast === 'function') {
      addToast('Joint Revenue & SRO Reconciliation Notice issued for Survey 124/2A.', 'info');
    }
  };

  const handleTriggerSync = () => {
    setSyncTriggered(true);
    setTimeout(() => {
      setSyncTriggered(false);
      if (typeof addToast === 'function') {
        addToast('Multi-registry query refreshed. Contradiction between Revenue e-Patta and SRO Index II confirmed.', 'warning');
      }
    }, 800);
  };

  return (
    <div className="dimension-subview-root">
      {/* Subview Intro Bar */}
      <div className="subview-header-strip">
        <div className="subview-title-wrap">
          <GitCompare size={16} className="text-emerald" />
          <span className="subview-title">Multi-Registry Cross-Source Synchronization Matrix</span>
        </div>
        <div className="subview-actions-wrap">
          <button 
            className="btn-subview-secondary"
            onClick={handleTriggerSync}
            disabled={syncTriggered}
          >
            <RefreshCw size={13} className={syncTriggered ? 'animate-spin' : ''} />
            <span>{syncTriggered ? 'Querying State DBs...' : 'Re-Query Registries'}</span>
          </button>
          <button 
            className={`btn-subview-primary ${noticeDispatched ? 'btn-done' : ''}`}
            onClick={handleDispatchNotice}
            disabled={noticeDispatched}
          >
            {noticeDispatched ? <Check size={13} className="text-emerald" /> : <Send size={13} />}
            <span>{noticeDispatched ? 'Notice Dispatched to SRO' : 'Issue SRO-Revenue Reconciliation Notice'}</span>
          </button>
        </div>
      </div>

      {/* Cross-Source Registries Table */}
      <div className="subview-table-card">
        <div className="subview-table-header">
          <span className="table-heading">Authoritative State Databases Concordance</span>
          <span className="table-subtext">Real-time cross-check across 4 government repositories</span>
        </div>

        <div className="entity-table-responsive">
          <table className="subview-data-table cross-source-table">
            <thead>
              <tr>
                <th>State Registry Source</th>
                <th>Competent Authority</th>
                <th>Recorded Title / Subject</th>
                <th>Document / Reference</th>
                <th>Recorded Extent</th>
                <th>Cross-Match Status</th>
              </tr>
            </thead>
            <tbody>
              {registrySources.map((reg, idx) => (
                <tr 
                  key={idx}
                  className={reg.isDiscrepant ? 'row-contradiction' : 'row-clean'}
                >
                  <td>
                    <div className="source-name-wrap">
                      <span className="source-title-bold">{reg.sourceName}</span>
                      <span className="source-tamil-sub">{reg.tamilName}</span>
                    </div>
                  </td>
                  <td className="authority-cell text-muted">{reg.authority}</td>
                  <td>
                    <span className={`owner-record-chip ${reg.isDiscrepant ? 'chip-red' : 'chip-green'}`}>
                      {reg.owner}
                    </span>
                  </td>
                  <td className="mono text-muted">{reg.pattaNo}</td>
                  <td className="mono font-semibold">{reg.area}</td>
                  <td>
                    <span className={`status-pill-badge ${reg.status.toLowerCase()}`}>
                      {reg.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Finding Explanation Box */}
      <div className="cross-source-alert-box">
        <AlertTriangle size={20} className="text-red alert-icon" />
        <div className="alert-content-wrap">
          <span className="alert-title">Critical Cross-Source Registry Contradiction Identified:</span>
          <p className="alert-desc">
            The Revenue Department’s <b>e-Patta (#PTA-2017-4412)</b> was modified in November 2017 to name <b>Kannan</b> as the sole titleholder. However, the Registration Department’s <b>SRO Pollachi Index II Book 1</b> contains <u>no corresponding registered transfer deed</u>, sale certificate, or probate decree from the legal grantee <b>Ramasamy</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
