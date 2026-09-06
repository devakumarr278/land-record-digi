import React, { useState, useEffect } from 'react';
import {
  ScrollText, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Info,
  Hash, User, Sparkles
} from 'lucide-react';
import { getAuditTrail } from '../../services/parcelService';

export default function DecisionProvenance({ parcelId }) {
  const [logs, setLogs] = useState(() => getAuditTrail(parcelId));

  useEffect(() => {
    setLogs(getAuditTrail(parcelId));
  }, [parcelId]);

  return (
    <div className="decision-provenance-card">
      <div className="provenance-header">
        <div className="p-head-left">
          <ScrollText size={18} className="text-emerald" />
          <h3 className="p-title">Decision Provenance & Integrity Log</h3>
        </div>
        <span className="p-badge">Tamper-Evident Ledger</span>
      </div>

      <div className="provenance-list">
        {logs.map((log) => {
          const isSuccess = log.type === 'success';
          const isError = log.type === 'error';
          const isWarning = log.type === 'warning';

          return (
            <div key={log.id} className="provenance-item">
              <div className="p-item-left">
                <div className={`p-dot ${log.type || 'info'}`} />
                <div className="p-line" />
              </div>

              <div className="p-item-content">
                <div className="p-item-top">
                  <span className="p-action bold">{log.action}</span>
                  <div className="p-time-badge">
                    <Clock size={12} />
                    <span>{log.time} · {log.date}</span>
                  </div>
                </div>

                <div className="p-actor-row">
                  <User size={13} className="text-muted" />
                  <span className="p-actor">{log.actor}</span>
                  {log.provenanceHash && (
                    <span className="p-hash mono">
                      <Hash size={11} />
                      {log.provenanceHash}
                    </span>
                  )}
                </div>

                {log.details && (
                  <p className="p-details">{log.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
