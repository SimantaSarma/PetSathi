import React from 'react';
import { ShieldCheck, Phone, Users, Star } from 'lucide-react';
import { VerificationType } from '../../types';

interface VerificationBadgeProps {
  type: VerificationType;
  lastVerifiedAt?: string;
  showStamp?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type,
  lastVerifiedAt,
  showStamp = false,
}) => {
  let icon = <ShieldCheck className="w-4 h-4 text-moss-700" strokeWidth={1.5} />;
  let label = 'Document-verified';
  let badgeClasses = 'bg-moss-50 text-moss-800 border border-moss-600/30';

  if (type === 'phone') {
    icon = <Phone className="w-3.5 h-3.5 text-moss-700" strokeWidth={1.5} />;
    label = 'Phone-verified';
    badgeClasses = 'bg-surface text-moss-800 border border-moss-600/40';
  } else if (type === 'community') {
    icon = <Users className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.5} />;
    label = 'Community-added';
    badgeClasses = 'bg-sand-100 text-ink-700 border border-ink-400/40';
  }

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      {showStamp && lastVerifiedAt && (
        <span className="overline text-[11px] text-ink-500 font-semibold tracking-wider">
          Last verified {lastVerifiedAt}
        </span>
      )}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses}`}
        title={`Verification status: ${label}`}
      >
        {icon}
        <span>{label}</span>
      </span>
    </div>
  );
};

export const RatingBadge: React.FC<{ rating?: { value: number; count: number } }> = ({ rating }) => {
  if (!rating || rating.count === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sand-100 text-ink-700 border border-sand-200">
        New
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 tabular-nums">
      <Star className="w-4 h-4 fill-saffron-500 text-saffron-500 inline-block" strokeWidth={1.5} />
      <span>{rating.value.toFixed(1)}</span>
      <span className="text-ink-500 font-normal text-xs">({rating.count})</span>
    </span>
  );
};
