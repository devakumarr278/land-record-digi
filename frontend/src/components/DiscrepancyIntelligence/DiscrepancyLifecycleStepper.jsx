import React from 'react';
import { Clock, Check } from 'lucide-react';

export default function DiscrepancyLifecycleStepper({ lifecycle = [] }) {
  if (!lifecycle || lifecycle.length === 0) return null;

  return (
    <div className="clean-lifecycle-track">
      {lifecycle.map((step, idx) => {
        const isCompleted = step.isCompleted;
        const isCurrent = step.isCurrent;

        return (
          <div key={idx} className={`clt-step ${isCompleted ? 'done' : isCurrent ? 'active' : 'pending'}`}>
            <div className="clt-circle">
              {isCompleted ? <Check size={12} /> : <span>{idx + 1}</span>}
            </div>
            <div className="clt-text">
              <span className="clt-name">{step.stageLabel}</span>
              <span className="clt-actor">{step.actor?.split('(')[0]?.trim()} · {step.timestamp}</span>
            </div>
            {idx < lifecycle.length - 1 && <div className="clt-line" />}
          </div>
        );
      })}
    </div>
  );
}
