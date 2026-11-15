import React from 'react';
import { Clock, AlertCircle, AlertTriangle, CheckCircle2, PauseCircle, HelpCircle } from 'lucide-react';
import { ComputedOpenStatus } from '../../utils/time';

interface StatusPillProps {
  status: ComputedOpenStatus;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const { state, displayText } = status;

  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-moss-700" strokeWidth={1.5} />;
  let pillStyles = 'bg-moss-50 text-moss-800 border-moss-600/30';

  if (state === 'open_24x7') {
    icon = (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss-600 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-moss-700"></span>
      </span>
    );
    pillStyles = 'bg-moss-100 text-moss-800 border-moss-700/30 font-semibold';
  } else if (state === 'closing_soon') {
    icon = <Clock className="w-3.5 h-3.5 text-amber-800" strokeWidth={1.5} />;
    pillStyles = 'bg-amber-100 text-amber-800 border-amber-800/30 font-medium';
  } else if (state === 'closed') {
    icon = <Clock className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.5} />;
    pillStyles = 'bg-sand-100 text-ink-700 border-sand-200';
  } else if (state === 'temporarily_closed') {
    icon = <PauseCircle className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.5} />;
    pillStyles = 'bg-sand-100 text-ink-500 border-sand-200';
  } else if (state === 'permanently_closed') {
    icon = <AlertTriangle className="w-3.5 h-3.5 text-alert-700" strokeWidth={1.5} />;
    pillStyles = 'bg-alert-100 text-alert-700 border-alert-700/30 font-semibold';
  } else if (state === 'hours_not_listed') {
    icon = <HelpCircle className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.5} />;
    pillStyles = 'bg-sand-100 text-ink-500 border-sand-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${pillStyles} ${className}`}
    >
      {icon}
      <span className="tabular-nums">{displayText}</span>
    </span>
  );
};
