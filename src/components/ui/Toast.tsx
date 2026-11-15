import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useDemo();

  if (!toast) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-moss-700 shrink-0" strokeWidth={1.5} />,
    success: <CheckCircle2 className="w-5 h-5 text-moss-700 shrink-0" strokeWidth={1.5} />,
    alert: <AlertCircle className="w-5 h-5 text-alert-700 shrink-0" strokeWidth={1.5} />,
  };

  const bgStyles = {
    info: 'bg-surface text-ink-900 border-sand-200',
    success: 'bg-moss-50 text-moss-800 border-moss-600/30',
    alert: 'bg-alert-100 text-alert-700 border-alert-700/30',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
    >
      <div
        className={`flex items-center gap-3 p-4 rounded-card border shadow-floating ${
          bgStyles[toast.type || 'info']
        }`}
      >
        {icons[toast.type || 'info']}
        <p className="text-sm font-medium flex-1">{toast.message}</p>
      </div>
    </div>
  );
};
