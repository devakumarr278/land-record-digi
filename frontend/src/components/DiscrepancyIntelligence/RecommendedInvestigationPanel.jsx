import React from 'react';
import {
  Building2, UserCheck, MapPin, ClipboardCheck, Clock, Send, Check
} from 'lucide-react';

export default function RecommendedInvestigationPanel({
  investigations = [],
  onDispatch = () => {},
  dispatchedMap = {}
}) {
  const getRoleIcon = (roleStr = '') => {
    if (roleStr.includes('Sub-Registrar')) return <Building2 size={13} className="text-emerald" />;
    if (roleStr.includes('Tehsildar')) return <UserCheck size={13} className="text-emerald" />;
    if (roleStr.includes('Surveyor')) return <MapPin size={13} className="text-emerald" />;
    return <ClipboardCheck size={13} className="text-emerald" />;
  };

  return (
    <div className="clean-rec-list">
      {investigations.map((rec) => {
        const isDispatched = dispatchedMap[rec.id] || rec.status === 'DISPATCHED' || rec.status === 'COMPLETED';

        return (
          <div key={rec.id} className={`clean-rec-row ${isDispatched ? 'dispatched' : ''}`}>
            <div className="crr-left">
              <div className="crr-role-pill">
                {getRoleIcon(rec.targetRole)}
                <span>{rec.targetRole.split('/')[0].trim()}</span>
              </div>
              <div className="crr-text-col">
                <span className="crr-title">{rec.title}</span>
                <span className="crr-sub">{rec.description?.length > 90 ? rec.description.slice(0, 88) + '…' : rec.description}</span>
              </div>
            </div>

            <div className="crr-right">
              <span className="crr-sla">
                <Clock size={11} />
                {rec.slaDays}
              </span>
              <button
                className={`btn-crr-dispatch ${isDispatched ? 'done' : ''}`}
                onClick={() => onDispatch(rec.id, rec.targetRole)}
                disabled={isDispatched}
              >
                {isDispatched ? (
                  <>
                    <Check size={12} />
                    <span>Dispatched</span>
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
