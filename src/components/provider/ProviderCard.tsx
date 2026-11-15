import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Navigation,
  MessageCircle,
  Heart,
  MoreVertical,
  Share2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Provider } from '../../types';
import { VerificationBadge, RatingBadge } from '../ui/Badge';
import { StatusPill } from '../ui/StatusPill';
import { SpeciesPictogram } from '../ui/SpeciesPictogram';
import { Button } from '../ui/Button';
import { computeProviderOpenStatus } from '../../utils/time';
import { calculateDistanceKm } from '../../utils/distance';
import { formatCurrencyINR, formatDistance } from '../../utils/formatters';
import { track } from '../../utils/analytics';
import { useDemo } from '../../context/DemoContext';

interface ProviderCardProps {
  provider: Provider;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
}

export const TYPE_LABELS: Record<string, string> = {
  vet_clinic: 'Vet Clinic',
  animal_hospital: 'Animal Hospital',
  boarding: 'Boarding & Daycare',
  diagnostics: 'Diagnostics Lab',
  ambulance: 'Animal Ambulance',
  ngo: 'NGO & Rescue',
};

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isHovered = false,
  onHover,
}) => {
  const { clockOverride, userCoords, toggleSave, isSaved, openCorrection, showToast } = useDemo();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const openStatus = computeProviderOpenStatus(provider, clockOverride);
  const distanceKm = calculateDistanceKm(
    userCoords.lat,
    userCoords.lng,
    provider.address.lat,
    provider.address.lng
  );
  const saved = isSaved(provider.id);

  // Call Action handler
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    track('call_click', {
      providerId: provider.id,
      providerName: provider.name,
      phone: provider.phone,
    });
    if (provider.phone) {
      // Check if desktop or mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (!isMobile) {
        navigator.clipboard.writeText(provider.phone);
        showToast(`Copied phone number ${provider.phone} to clipboard`, 'success');
      } else {
        window.location.href = `tel:${provider.phone.replace(/\s+/g, '')}`;
      }
    }
  };

  // WhatsApp Action handler
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = (provider.whatsapp || provider.phone || '').replace(/[^0-9]/g, '');
    track('whatsapp_click', {
      providerId: provider.id,
      providerName: provider.name,
      whatsapp: cleanNumber,
    });
    if (cleanNumber) {
      const message = encodeURIComponent(
        `Hello ${provider.name}, I found your listing on Practo for Animals. Are you available right now for an enquiry?`
      );
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Directions Action handler
  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    track('directions_click', {
      providerId: provider.id,
      providerName: provider.name,
      lat: provider.address.lat,
      lng: provider.address.lng,
    });
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${provider.address.lat},${provider.address.lng}&destination_place_id=${encodeURIComponent(
      provider.name
    )}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  // Share Action handler
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    track('share_click', { providerId: provider.id });
    const shareData = {
      title: `${provider.name} | Practo for Animals`,
      text: `Find animal care at ${provider.name} (${provider.address.area}, ${provider.address.city})`,
      url: `${window.location.origin}/provider/${provider.slug}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      showToast('Listing link copied to clipboard', 'info');
    }
  };

  // Calculate starting fee
  const minPrice = provider.services.reduce((min, s) => {
    if (s.fromPrice !== undefined && s.fromPrice > 0) {
      return min === null ? s.fromPrice : Math.min(min, s.fromPrice);
    }
    return min;
  }, null as number | null);

  const hasPhotos = provider.photos && provider.photos.length > 0 && !imgError;

  return (
    <article
      onMouseEnter={() => onHover?.(provider.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative bg-surface rounded-card border transition-all duration-150 p-4 sm:p-5 flex flex-col justify-between gap-4 ${
        isHovered
          ? 'border-moss-700 shadow-floating ring-1 ring-moss-700'
          : 'border-sand-200 hover:border-ink-400 shadow-subtle'
      }`}
    >
      {/* Top Section: 96px tile + Info */}
      <div className="flex items-start gap-4">
        {/* 96px Thumbnail / Tonal Pictogram Fallback */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-sand-100 border border-sand-200 flex items-center justify-center">
          {hasPhotos ? (
            <img
              src={provider.photos[0]}
              alt={provider.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-moss-700 bg-moss-50/70 w-full h-full">
              <SpeciesPictogram species={provider.animals[0] || 'dog'} size="lg" />
              <span className="text-[10px] font-semibold text-moss-800 uppercase tracking-wider mt-1 text-center line-clamp-1">
                {TYPE_LABELS[provider.types[0]]}
              </span>
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Header Row: Badges & Menu */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-moss-800 bg-moss-50 px-2 py-0.5 rounded border border-moss-600/20">
                {TYPE_LABELS[provider.types[0]]}
              </span>
              <VerificationBadge
                type={provider.verification}
                lastVerifiedAt={provider.lastVerifiedAt}
              />
            </div>

            {/* Save & More Menu */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(provider.id);
                }}
                className={`p-1.5 rounded-btn transition-colors focus-visible:ring-2 focus-visible:ring-moss-700 ${
                  saved
                    ? 'text-alert-700 bg-alert-100/50 hover:bg-alert-100'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-sand-100'
                }`}
                aria-label={saved ? 'Remove from saved' : 'Save provider'}
              >
                <Heart
                  className={`w-4 h-4 ${saved ? 'fill-alert-700 text-alert-700' : ''}`}
                  strokeWidth={1.5}
                />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="p-1.5 text-ink-500 hover:text-ink-900 rounded-btn hover:bg-sand-100 focus-visible:ring-2 focus-visible:ring-moss-700"
                  aria-label="More options"
                  aria-expanded={menuOpen}
                >
                  <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-lg border border-sand-200 shadow-dropdown z-30 py-1 animate-in fade-in duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={handleShare}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-sand-100 hover:text-ink-900 flex items-center gap-2"
                    >
                      <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Share Listing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        openCorrection(provider);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-sand-100 hover:text-ink-900 flex items-center gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Submit a Correction
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Provider Name (2-line clamp) */}
          <Link
            to={`/provider/${provider.slug}`}
            className="block focus-visible:ring-2 focus-visible:ring-moss-700 rounded"
          >
            <h3 className="font-serif text-base sm:text-lg font-bold text-ink-900 leading-snug line-clamp-2 hover:text-moss-700 transition-colors">
              {provider.name}
            </h3>
          </Link>

          {/* Area, City & Distance */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-ink-500">
            <span className="flex items-center gap-1 font-medium text-ink-700">
              <MapPin className="w-3 h-3 text-moss-700 shrink-0" strokeWidth={1.5} />
              <span>{provider.address.area}, {provider.address.city}</span>
            </span>
            <span>&bull;</span>
            <span className="tabular-nums font-semibold text-ink-900">
              {formatDistance(distanceKm)} away
            </span>
            <span>&bull;</span>
            <RatingBadge rating={provider.rating} />
          </div>

          {/* Open Status Pill */}
          <div className="pt-0.5">
            <StatusPill status={openStatus} />
          </div>
        </div>
      </div>

      {/* Middle: Type-Specific Meta Row */}
      <div className="pt-2 border-t border-sand-200 text-xs text-ink-700 flex flex-wrap items-center justify-between gap-2">
        {/* Ambulance facet */}
        {provider.types.includes('ambulance') && provider.typeSpecific && (
          <div className="flex items-center gap-2 font-medium text-ink-700 bg-sand-100 px-2.5 py-1 rounded-btn w-full">
            <span>Coverage: <strong>{provider.typeSpecific.coverageKm} km</strong></span>
            <span>&bull;</span>
            <span>Oxygen: <strong>{provider.typeSpecific.hasOxygen ? 'Equipped' : 'Standard'}</strong></span>
            {provider.typeSpecific.dispatcherPhone && (
              <>
                <span>&bull;</span>
                <span>Dispatcher available</span>
              </>
            )}
          </div>
        )}

        {/* NGO facet */}
        {provider.types.includes('ngo') && provider.typeSpecific && (
          <div className="flex items-center gap-2 font-medium text-moss-800 bg-moss-50 px-2.5 py-1 rounded-btn w-full">
            <span>Causes: <strong>{provider.typeSpecific.causes?.slice(0, 2).join(', ')}</strong></span>
            {provider.typeSpecific.acceptsDonations && (
              <>
                <span>&bull;</span>
                <span className="font-semibold text-moss-700">Accepts 80G Donations</span>
              </>
            )}
          </div>
        )}

        {/* Boarding facet */}
        {provider.types.includes('boarding') && provider.typeSpecific && (
          <div className="flex items-center gap-2 font-medium text-ink-700 bg-sand-100 px-2.5 py-1 rounded-btn w-full">
            <span>Capacity: <strong>{provider.typeSpecific.capacity} guests</strong></span>
            <span>&bull;</span>
            <span>{provider.typeSpecific.cageFree ? 'Cage-Free' : 'Private suites'}</span>
            <span>&bull;</span>
            <span>{provider.typeSpecific.hasCctv ? 'Live CCTV' : 'Daily Updates'}</span>
          </div>
        )}

        {/* Diagnostics facet */}
        {provider.types.includes('diagnostics') && provider.typeSpecific && (
          <div className="flex items-center gap-2 font-medium text-ink-700 bg-sand-100 px-2.5 py-1 rounded-btn w-full">
            <span>Tests: <strong>{provider.typeSpecific.testsCount}+ tests</strong></span>
            <span>&bull;</span>
            <span>Turnaround: <strong>{provider.typeSpecific.turnaroundHours}h</strong></span>
            <span>&bull;</span>
            <span>{provider.typeSpecific.homeSampleCollection ? 'Home Collection available' : 'In-lab only'}</span>
          </div>
        )}

        {/* Animals treated pictograms */}
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="text-[11px] text-ink-500 font-medium mr-1">Animals:</span>
          {provider.animals.map((species) => (
            <SpeciesPictogram key={species} species={species} size="sm" />
          ))}
        </div>

        {/* Starting fee */}
        {minPrice !== null && (
          <div className="text-right tabular-nums">
            <span className="text-[11px] text-ink-500">From </span>
            <span className="font-semibold text-ink-900">{formatCurrencyINR(minPrice)}</span>
          </div>
        )}
      </div>

      {/* Top 3 services preview */}
      <div className="flex items-center flex-wrap gap-1 text-[11px] text-ink-700">
        {provider.services.slice(0, 3).map((srv, idx) => (
          <span
            key={idx}
            className="bg-sand-100 border border-sand-200 px-2 py-0.5 rounded text-ink-700 line-clamp-1"
          >
            {srv.name}
          </span>
        ))}
        {provider.services.length > 3 && (
          <span className="text-ink-500 font-medium text-[11px] px-1">
            +{provider.services.length - 3} more
          </span>
        )}
      </div>

      {/* Permanently closed Edge State Banner */}
      {provider.status === 'permanently_closed' ? (
        <div className="p-3 bg-alert-100 border border-alert-700/20 rounded-btn text-xs text-alert-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            This provider is permanently closed.
          </span>
          <Link
            to="/search"
            className="font-semibold underline hover:no-underline text-xs shrink-0 ml-2"
          >
            Find alternatives
          </Link>
        </div>
      ) : (
        /* Action Row: Call (primary filled), Directions (secondary), WhatsApp (icon) */
        <div className="pt-2 border-t border-sand-200 flex items-center gap-2">
          {provider.phone ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleCall}
              className="flex-1 font-semibold text-white bg-moss-700 hover:bg-moss-800"
            >
              <Phone className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
              <span>Call</span>
            </Button>
          ) : (
            <div className="flex-1 p-2 bg-sand-100 rounded-btn text-center text-xs text-ink-500 border border-sand-200 flex items-center justify-center gap-1.5">
              <span>Phone not listed &bull;</span>
              <button
                type="button"
                onClick={() => openCorrection(provider)}
                className="text-moss-700 font-semibold underline hover:no-underline"
              >
                Submit
              </button>
            </div>
          )}

          {/* Directions Secondary CTA */}
          <Button
            variant="secondary"
            size="md"
            onClick={handleDirections}
            className="px-3 border-sand-200"
            title="Get Directions"
          >
            <Navigation className="w-4 h-4 text-moss-700" strokeWidth={1.5} />
            <span className="hidden sm:inline text-xs font-medium">Directions</span>
          </Button>

          {/* WhatsApp Icon CTA */}
          {(provider.whatsapp || provider.phone) && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleWhatsApp}
              className="px-3 border-sand-200"
              title="Chat on WhatsApp"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-[#128C7E]" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      )}
    </article>
  );
};
