import React from 'react';

export const ProviderCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="bg-surface rounded-card border border-sand-200 p-4 sm:p-5 flex flex-col justify-between gap-4 animate-pulse shadow-subtle min-h-[290px]"
    >
      {/* Top Section */}
      <div className="flex items-start gap-4">
        {/* 96px Thumbnail */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg bg-sand-200 animate-shimmer" />

        {/* Content column */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="w-24 h-4 bg-sand-200 rounded-btn animate-shimmer" />
            <div className="w-6 h-6 bg-sand-200 rounded-btn animate-shimmer" />
          </div>
          <div className="w-3/4 h-5 bg-sand-200 rounded-btn animate-shimmer" />
          <div className="w-1/2 h-3.5 bg-sand-200 rounded-btn animate-shimmer" />
          <div className="w-28 h-5 bg-sand-200 rounded-pill animate-shimmer" />
        </div>
      </div>

      {/* Meta Row */}
      <div className="pt-2 border-t border-sand-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-sand-200 animate-shimmer" />
          <div className="w-6 h-6 rounded-full bg-sand-200 animate-shimmer" />
        </div>
        <div className="w-16 h-4 bg-sand-200 rounded-btn animate-shimmer" />
      </div>

      {/* Services pills */}
      <div className="flex items-center gap-2">
        <div className="w-20 h-4 bg-sand-200 rounded-btn animate-shimmer" />
        <div className="w-24 h-4 bg-sand-200 rounded-btn animate-shimmer" />
        <div className="w-16 h-4 bg-sand-200 rounded-btn animate-shimmer" />
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-sand-200 flex items-center gap-2">
        <div className="flex-1 h-11 bg-sand-200 rounded-btn animate-shimmer" />
        <div className="w-16 h-11 bg-sand-200 rounded-btn animate-shimmer" />
        <div className="w-11 h-11 bg-sand-200 rounded-btn animate-shimmer" />
      </div>
    </div>
  );
};
