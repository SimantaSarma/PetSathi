import React from 'react';
import { SearchFilters, ProviderType, AnimalSpecies } from '../../types';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { SpeciesPictogram, SPECIES_LABELS } from '../ui/SpeciesPictogram';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  onReset: () => void;
  resultCount: number;
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  resultCount,
  isMobileModal = false,
  onCloseMobile,
}) => {
  const categories: { id: ProviderType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'vet_clinic', label: 'Vet Clinics' },
    { id: 'animal_hospital', label: 'Animal Hospitals' },
    { id: 'boarding', label: 'Boarding & Daycare' },
    { id: 'diagnostics', label: 'Diagnostics & Labs' },
    { id: 'ambulance', label: 'Animal Ambulance' },
    { id: 'ngo', label: 'NGOs & Rescue' },
  ];

  const distances = [1, 3, 5, 10, 25];

  const speciesList: AnimalSpecies[] = ['dog', 'cat', 'bird', 'rabbit', 'livestock', 'exotic'];

  const toggleAnimal = (sp: AnimalSpecies) => {
    const cur = filters.animals || [];
    const next = cur.includes(sp) ? cur.filter((a) => a !== sp) : [...cur, sp];
    onChange({ ...filters, animals: next });
  };

  const content = (
    <div className="space-y-6 text-sm text-ink-900">
      {/* 1. Category */}
      <div className="space-y-2">
        <label className="font-semibold text-xs overline tracking-wider text-ink-700 block">
          Category
        </label>
        <div className="space-y-1.5">
          {categories.map((c) => (
            <label
              key={c.id}
              className={`flex items-center justify-between p-2 rounded-btn cursor-pointer transition-colors ${
                (filters.category || 'all') === c.id
                  ? 'bg-moss-50 text-moss-800 font-semibold border border-moss-700/30'
                  : 'hover:bg-sand-100 text-ink-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="filter_category"
                  value={c.id}
                  checked={(filters.category || 'all') === c.id}
                  onChange={() => onChange({ ...filters, category: c.id })}
                  className="accent-moss-700 w-4 h-4"
                />
                <span>{c.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 2 & 3. Quick Toggles: Open Now & 24x7 Emergency */}
      <div className="space-y-2 pt-4 border-t border-sand-200">
        <label className="font-semibold text-xs overline tracking-wider text-ink-700 block">
          Operating Status
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.openNow}
              onChange={(e) => onChange({ ...filters, openNow: e.target.checked })}
              className="accent-moss-700 w-4 h-4 rounded"
            />
            <span className="font-medium text-ink-900">Open now</span>
          </label>
          <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.emergency24x7}
              onChange={(e) => onChange({ ...filters, emergency24x7: e.target.checked })}
              className="accent-moss-700 w-4 h-4 rounded"
            />
            <span className="font-medium text-alert-700">24×7 Emergency ready</span>
          </label>
        </div>
      </div>

      {/* 4. Distance Radius */}
      <div className="space-y-2 pt-4 border-t border-sand-200">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-xs overline tracking-wider text-ink-700">
            Within Distance
          </label>
          {filters.maxDistanceKm && (
            <span className="text-xs text-moss-700 font-semibold tabular-nums">
              {filters.maxDistanceKm} km
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {distances.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  maxDistanceKm: filters.maxDistanceKm === d ? undefined : d,
                })
              }
              className={`px-3 py-1.5 rounded-pill text-xs font-medium tabular-nums transition-colors ${
                filters.maxDistanceKm === d
                  ? 'bg-moss-700 text-white font-semibold'
                  : 'bg-sand-100 text-ink-700 hover:bg-sand-200 border border-sand-200'
              }`}
            >
              {d} km
            </button>
          ))}
        </div>
      </div>

      {/* 5. Animals Treated */}
      <div className="space-y-2 pt-4 border-t border-sand-200">
        <label className="font-semibold text-xs overline tracking-wider text-ink-700 block">
          Animals Treated
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {speciesList.map((sp) => {
            const selected = (filters.animals || []).includes(sp);
            return (
              <button
                key={sp}
                type="button"
                onClick={() => toggleAnimal(sp)}
                className={`flex items-center gap-2 p-2 rounded-btn text-xs font-medium transition-colors text-left border ${
                  selected
                    ? 'bg-moss-50 border-moss-700 text-moss-800 font-semibold'
                    : 'bg-surface border-sand-200 text-ink-700 hover:bg-sand-100'
                }`}
              >
                <SpeciesPictogram species={sp} size="sm" active={selected} />
                <span className="truncate">{SPECIES_LABELS[sp]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Indicative Consultation / Service Fee */}
      <div className="space-y-2 pt-4 border-t border-sand-200">
        <label className="font-semibold text-xs overline tracking-wider text-ink-700 block">
          Consultation / Fee
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'Any fee' },
            { id: 'under_500', label: 'Under ₹500' },
            { id: '500_1000', label: '₹500 – ₹1,000' },
            { id: 'above_1000', label: '₹1,000+' },
          ].map((f) => (
            <label
              key={f.id}
              className={`flex items-center gap-2.5 p-2 rounded-btn cursor-pointer ${
                (filters.feeRange || 'all') === f.id
                  ? 'bg-moss-50 text-moss-800 font-semibold'
                  : 'hover:bg-sand-100 text-ink-700'
              }`}
            >
              <input
                type="radio"
                name="filter_fee"
                value={f.id}
                checked={(filters.feeRange || 'all') === f.id}
                onChange={() => onChange({ ...filters, feeRange: f.id as any })}
                className="accent-moss-700 w-4 h-4"
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 7 & 8. Trust & Rating */}
      <div className="space-y-2 pt-4 border-t border-sand-200">
        <label className="font-semibold text-xs overline tracking-wider text-ink-700 block">
          Trust & Rating
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.verifiedOnly}
              onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
              className="accent-moss-700 w-4 h-4 rounded"
            />
            <span className="font-medium text-ink-900">Document-verified only</span>
          </label>
          <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.minRating4}
              onChange={(e) => onChange({ ...filters, minRating4: e.target.checked })}
              className="accent-moss-700 w-4 h-4 rounded"
            />
            <span className="font-medium text-ink-900">Rated ★ 4.0 and above</span>
          </label>
        </div>
      </div>

      {/* 9. Category-Specific Facets (Conditional) */}
      {(filters.category === 'boarding' ||
        filters.category === 'diagnostics' ||
        filters.category === 'ambulance' ||
        filters.category === 'ngo') && (
        <div className="space-y-2 pt-4 border-t border-sand-200 animate-in fade-in duration-150">
          <label className="font-semibold text-xs overline tracking-wider text-ink-700 block">
            {filters.category === 'boarding'
              ? 'Boarding Features'
              : filters.category === 'diagnostics'
              ? 'Diagnostics Features'
              : filters.category === 'ambulance'
              ? 'Ambulance Features'
              : 'NGO / Rescue Causes'}
          </label>

          {filters.category === 'boarding' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters.hasCctv}
                  onChange={(e) => onChange({ ...filters, hasCctv: e.target.checked })}
                  className="accent-moss-700 w-4 h-4 rounded"
                />
                <span>Live CCTV Access</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters.cageFree}
                  onChange={(e) => onChange({ ...filters, cageFree: e.target.checked })}
                  className="accent-moss-700 w-4 h-4 rounded"
                />
                <span>Cage-free play lawns</span>
              </label>
            </div>
          )}

          {filters.category === 'diagnostics' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters.homeSampleCollection}
                  onChange={(e) =>
                    onChange({ ...filters, homeSampleCollection: e.target.checked })
                  }
                  className="accent-moss-700 w-4 h-4 rounded"
                />
                <span>Home sample collection</span>
              </label>
            </div>
          )}

          {filters.category === 'ambulance' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters.hasOxygen}
                  onChange={(e) => onChange({ ...filters, hasOxygen: e.target.checked })}
                  className="accent-moss-700 w-4 h-4 rounded"
                />
                <span>Oxygen cylinder equipped</span>
              </label>
            </div>
          )}

          {filters.category === 'ngo' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters.acceptsDonations}
                  onChange={(e) => onChange({ ...filters, acceptsDonations: e.target.checked })}
                  className="accent-moss-700 w-4 h-4 rounded"
                />
                <span>Accepts donations (80G)</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters.acceptsAdoption}
                  onChange={(e) => onChange({ ...filters, acceptsAdoption: e.target.checked })}
                  className="accent-moss-700 w-4 h-4 rounded"
                />
                <span>Adoptions available</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Reset Filter Button */}
      <div className="pt-4 border-t border-sand-200">
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-ink-500 hover:text-ink-900 rounded-btn hover:bg-sand-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset all filters</span>
        </button>
      </div>
    </div>
  );

  // If Mobile Bottom Sheet
  if (isMobileModal) {
    return (
      <div
        className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-surface rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-floating">
          {/* Sheet Header */}
          <div className="px-5 py-4 border-b border-sand-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-moss-700" strokeWidth={1.5} />
              <h3 className="font-serif text-lg font-bold text-ink-900">Filters</h3>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-btn text-ink-500 hover:text-ink-900 hover:bg-sand-100"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Sheet Body */}
          <div className="px-5 py-6 overflow-y-auto flex-1">{content}</div>

          {/* Sheet Footer with live CTA: "Show X results" */}
          <div className="p-4 border-t border-sand-200 bg-paper shrink-0 flex items-center gap-3">
            <Button variant="ghost" size="md" onClick={onReset} className="text-xs">
              Reset
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onCloseMobile}
              className="font-bold text-white bg-moss-700"
            >
              Show {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Filter Rail
  return (
    <aside
      aria-label="Filter listings"
      className="w-full bg-surface rounded-card border border-sand-200 p-5 shadow-subtle"
    >
      <div className="flex items-center justify-between pb-4 border-b border-sand-200 mb-5">
        <h3 className="font-serif text-base font-bold text-ink-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-moss-700" strokeWidth={1.5} />
          <span>Filters</span>
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-moss-700 font-semibold hover:underline"
        >
          Clear all
        </button>
      </div>
      {content}
    </aside>
  );
};
