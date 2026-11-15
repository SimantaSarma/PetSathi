import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Phone,
  Navigation,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Heart,
  Share2,
  HelpCircle,
  MapPin,
  Car,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Calendar,
  Building,
} from 'lucide-react';
import { SAMPLE_PROVIDERS } from '../data/providers';
import { Button } from '../components/ui/Button';
import { VerificationBadge, RatingBadge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { SpeciesPictogram } from '../components/ui/SpeciesPictogram';
import { ProviderCard, TYPE_LABELS } from '../components/provider/ProviderCard';
import { computeProviderOpenStatus, get24HourTimeline, getKolkataDateTime } from '../utils/time';
import { calculateDistanceKm } from '../utils/distance';
import { formatCurrencyINR, formatDistance } from '../utils/formatters';
import { track } from '../utils/analytics';
import { useDemo } from '../context/DemoContext';

export const ProviderDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { clockOverride, userCoords, toggleSave, isSaved, openCorrection, showToast } = useDemo();
  const [serviceFilter, setServiceFilter] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);

  const provider = SAMPLE_PROVIDERS.find((p) => p.slug === slug);

  if (!provider) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-full bg-sand-100 flex items-center justify-center text-ink-500">
          <AlertTriangle className="w-7 h-7 text-moss-700" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">Provider not found</h1>
        <p className="text-sm text-ink-500">
          The animal care facility you are looking for may have relocated or been unlisted.
        </p>
        <Link to="/search">
          <Button variant="primary">Search other providers</Button>
        </Link>
      </div>
    );
  }

  const openStatus = computeProviderOpenStatus(provider, clockOverride);
  const distanceKm = calculateDistanceKm(
    userCoords.lat,
    userCoords.lng,
    provider.address.lat,
    provider.address.lng
  );
  const saved = isSaved(provider.id);

  const { dayOfWeek, currentHour } = getKolkataDateTime(clockOverride);

  // 24-hour timeline bars
  const opdTimeline = get24HourTimeline(
    provider.hours?.structuredOpd || [],
    dayOfWeek,
    provider.hours?.is24x7
  );

  const emergencyTimeline = get24HourTimeline(
    provider.hours?.structuredEmergency || [],
    dayOfWeek,
    provider.hours?.is24x7 || provider.hours?.emergency === '24x7'
  );

  // Action handlers
  const handleCall = () => {
    track('call_click', {
      providerId: provider.id,
      providerName: provider.name,
      phone: provider.phone,
    });
    if (provider.phone) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (!isMobile) {
        navigator.clipboard.writeText(provider.phone);
        showToast(`Copied phone number ${provider.phone} to clipboard`, 'success');
      } else {
        window.location.href = `tel:${provider.phone.replace(/\s+/g, '')}`;
      }
    }
  };

  const handleWhatsApp = () => {
    const cleanNumber = (provider.whatsapp || provider.phone || '').replace(/[^0-9]/g, '');
    track('whatsapp_click', {
      providerId: provider.id,
      providerName: provider.name,
      whatsapp: cleanNumber,
    });
    if (cleanNumber) {
      const msg = encodeURIComponent(
        `Hello ${provider.name}, I found your listing on Practo for Animals. I have an enquiry about your services.`
      );
      window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDirections = () => {
    track('directions_click', {
      providerId: provider.id,
      providerName: provider.name,
      lat: provider.address.lat,
      lng: provider.address.lng,
    });
    const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.address.lat},${provider.address.lng}&destination_place_id=${encodeURIComponent(
      provider.name
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    track('share_click', { providerId: provider.id });
    const shareData = {
      title: `${provider.name} | Practo for Animals`,
      text: `Verified care at ${provider.name}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Listing link copied to clipboard', 'info');
    }
  };

  const handleClaim = () => {
    track('claim_listing_click', { providerId: provider.id, providerName: provider.name });
    showToast(
      'Claim request initiated. Our verification team will contact you within 2 working days.',
      'info'
    );
  };

  // Nearby alternatives (3 other providers in same city/specialty)
  const nearbyAlternatives = SAMPLE_PROVIDERS.filter(
    (p) => p.id !== provider.id && p.status !== 'permanently_closed'
  ).slice(0, 3);

  // Filtered services
  const displayedServices = provider.services.filter((s) =>
    s.name.toLowerCase().includes(serviceFilter.toLowerCase())
  );
  const visibleServices = showAllServices ? displayedServices : displayedServices.slice(0, 10);

  return (
    <div className="min-h-screen bg-paper pb-28 sm:pb-20">
      
      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="bg-surface border-b border-sand-200 py-3 px-4 sm:px-6">
        <div className="max-w-container mx-auto flex items-center gap-1.5 text-xs text-ink-500 overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-ink-900 transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link to="/search" className="hover:text-ink-900 transition-colors shrink-0">
            {provider.address.city}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link
            to={`/search?type=${provider.types[0]}`}
            className="hover:text-ink-900 transition-colors shrink-0"
          >
            {TYPE_LABELS[provider.types[0]]}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-ink-900 font-semibold truncate shrink-0 max-w-[200px]">
            {provider.name}
          </span>
        </div>
      </nav>

      {/* Permanently closed edge banner */}
      {provider.status === 'permanently_closed' && (
        <aside
          aria-label="Closed status alert"
          className="bg-alert-100 border-b border-alert-700/30 p-4 text-alert-700"
        >
          <div className="max-w-container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">
                This facility has permanently shut down operations. Do not visit this location.
              </p>
            </div>
            <Link to="/search" className="shrink-0">
              <Button variant="outline" size="sm" className="border-alert-700 text-alert-700 bg-surface">
                Find alternative providers
              </Button>
            </Link>
          </div>
        </aside>
      )}

      {/* Profile Header Hero */}
      <header className="bg-surface border-b border-sand-200 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-container mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              {/* Type & Verification Badges */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-moss-800 bg-moss-50 px-2.5 py-1 rounded border border-moss-600/30">
                  {TYPE_LABELS[provider.types[0]]}
                </span>
                <VerificationBadge
                  type={provider.verification}
                  lastVerifiedAt={provider.lastVerifiedAt}
                  showStamp
                />
              </div>

              {/* Title & Rating */}
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink-900 leading-tight">
                {provider.name}
              </h1>

              {/* Status pill & Rating */}
              <div className="flex items-center flex-wrap gap-3 pt-1">
                <StatusPill status={openStatus} />
                <span className="text-ink-400">&bull;</span>
                <RatingBadge rating={provider.rating} />
                <span className="text-ink-400">&bull;</span>
                <span className="text-sm text-ink-700 font-medium tabular-nums">
                  {formatDistance(distanceKm)} from your location
                </span>
              </div>

              {/* Address & Landmark */}
              <p className="text-sm text-ink-700 flex items-start gap-1.5 pt-1">
                <MapPin className="w-4 h-4 text-moss-700 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  {provider.address.line}, {provider.address.area}, {provider.address.city} –{' '}
                  <strong className="font-mono">{provider.address.pincode}</strong>
                  {provider.address.landmark && (
                    <span className="text-ink-500 ml-1">({provider.address.landmark})</span>
                  )}
                </span>
              </p>
            </div>

            {/* Desktop Action Buttons Bar */}
            {provider.status !== 'permanently_closed' && (
              <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSave(provider.id)}
                    className="p-2.5 rounded-btn border border-sand-200 hover:bg-sand-100 text-ink-700 transition-colors focus-visible:ring-2 focus-visible:ring-moss-700"
                    aria-label={saved ? 'Remove from saved' : 'Save provider'}
                  >
                    <Heart
                      className={`w-5 h-5 ${saved ? 'fill-alert-700 text-alert-700' : ''}`}
                      strokeWidth={1.5}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2.5 rounded-btn border border-sand-200 hover:bg-sand-100 text-ink-700 transition-colors focus-visible:ring-2 focus-visible:ring-moss-700"
                    aria-label="Share listing"
                  >
                    <Share2 className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {provider.phone ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleCall}
                      className="min-w-[140px] font-bold"
                    >
                      <Phone className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span>Call Now</span>
                    </Button>
                  ) : (
                    <div className="p-2.5 bg-sand-100 rounded-btn text-xs text-ink-500 border border-sand-200">
                      Phone not listed
                    </div>
                  )}

                  <Button variant="secondary" size="lg" onClick={handleDirections}>
                    <Navigation className="w-4 h-4 mr-2 text-moss-700" strokeWidth={1.5} />
                    <span>Directions</span>
                  </Button>

                  {(provider.whatsapp || provider.phone) && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={handleWhatsApp}
                      className="px-4"
                      title="WhatsApp Chat"
                    >
                      <MessageCircle className="w-5 h-5 text-[#128C7E]" strokeWidth={1.5} />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-container mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Sections */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. About Section */}
          <section className="bg-surface rounded-card border border-sand-200 p-6 shadow-subtle space-y-3">
            <h2 className="font-serif text-xl font-bold text-ink-900">About this facility</h2>
            <p className="text-base text-ink-700 leading-relaxed max-w-prose">
              {provider.about}
            </p>
          </section>

          {/* 2. Animals Treated */}
          <section className="bg-surface rounded-card border border-sand-200 p-6 shadow-subtle space-y-3">
            <h2 className="font-serif text-xl font-bold text-ink-900">Animals Treated</h2>
            <p className="text-xs text-ink-500">
              Equipped with species-appropriate handling wards and diagnostics:
            </p>
            <div className="flex items-center flex-wrap gap-3 pt-1">
              {provider.animals.map((sp) => (
                <div
                  key={sp}
                  className="flex items-center gap-2 bg-sand-100 border border-sand-200 px-3 py-1.5 rounded-pill"
                >
                  <SpeciesPictogram species={sp} size="sm" />
                  <span className="text-sm font-semibold text-ink-900 capitalize">{sp}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Hours & 24h Visual Timeline */}
          <section className="bg-surface rounded-card border border-sand-200 p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-ink-900">Operating Schedule</h2>
              <StatusPill status={openStatus} />
            </div>

            {/* 24-Hour Timeline Bar as per Signature Detail 2 */}
            <div className="space-y-3 p-4 bg-sand-100/60 rounded-card border border-sand-200">
              <div className="flex items-center justify-between text-xs text-ink-700 font-semibold">
                <span>Today’s 24-Hour Availability</span>
                <span className="text-[11px] text-ink-500 font-normal">
                  Red indicator marks current hour ({currentHour}:00 IST)
                </span>
              </div>

              {/* OPD Row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-ink-700">
                  <span>General OPD</span>
                  <span>{provider.hours?.is24x7 ? '24×7' : 'Standard Slots'}</span>
                </div>
                <div className="grid grid-cols-24 gap-0.5 h-6 bg-sand-200 rounded p-0.5 relative">
                  {opdTimeline.map((isOpen, h) => (
                    <div
                      key={h}
                      title={`${h}:00 - ${h + 1}:00: ${isOpen ? 'Open' : 'Closed'}`}
                      className={`h-full rounded-xs transition-colors ${
                        isOpen ? 'bg-moss-700' : 'bg-sand-200/50'
                      }`}
                    />
                  ))}
                  {/* Live "now" marker */}
                  <div
                    style={{ left: `${(currentHour / 24) * 100}%` }}
                    className="absolute top-0 bottom-0 w-1 bg-alert-700 rounded-full shadow-subtle z-10"
                    title={`Now: ${currentHour}:00`}
                  />
                </div>
              </div>

              {/* Emergency Row */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-ink-700">
                  <span className="text-alert-700 font-semibold">Emergency Triage</span>
                  <span className="text-alert-700 font-semibold">
                    {provider.hours?.emergency === '24x7' || provider.hours?.is24x7
                      ? '24×7 Active'
                      : 'On Call'}
                  </span>
                </div>
                <div className="grid grid-cols-24 gap-0.5 h-6 bg-sand-200 rounded p-0.5 relative">
                  {emergencyTimeline.map((isOpen, h) => (
                    <div
                      key={h}
                      title={`${h}:00 - ${h + 1}:00 Emergency: ${isOpen ? 'Open' : 'Closed'}`}
                      className={`h-full rounded-xs transition-colors ${
                        isOpen ? 'bg-alert-700' : 'bg-sand-200/50'
                      }`}
                    />
                  ))}
                  {/* Live "now" marker */}
                  <div
                    style={{ left: `${(currentHour / 24) * 100}%` }}
                    className="absolute top-0 bottom-0 w-1 bg-alert-700 rounded-full shadow-subtle z-10"
                  />
                </div>
              </div>

              {/* Hour numbers */}
              <div className="flex justify-between text-[10px] text-ink-500 tabular-nums px-0.5">
                <span>12 am</span>
                <span>6 am</span>
                <span>12 pm</span>
                <span>6 pm</span>
                <span>11 pm</span>
              </div>
            </div>

            {/* Detailed text schedules */}
            <div className="space-y-2 text-sm text-ink-900 divide-y divide-sand-200">
              {provider.hours?.opd ? (
                provider.hours.opd.map((slot, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between">
                    <span className="font-medium text-ink-700">{slot.split(':')[0]}</span>
                    <span className="font-semibold text-ink-900 tabular-nums">
                      {slot.substring(slot.indexOf(':') + 1)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-ink-500 py-2">Hours not published by provider.</p>
              )}
            </div>

            {provider.hours?.notes && (
              <p className="text-xs text-ink-500 bg-sand-100 p-3 rounded-btn border border-sand-200">
                <strong>Schedule note:</strong> {provider.hours.notes}
              </p>
            )}
          </section>

          {/* 4. Services & Indicative Fees Table */}
          <section className="bg-surface rounded-card border border-sand-200 p-6 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-ink-900">
                  Services & Indicative Fees
                </h2>
                <p className="text-xs text-ink-500">
                  Fees are indicative — confirm with the provider prior to treatment.
                </p>
              </div>

              {/* Service filter input for 40+ services */}
              {provider.services.length > 8 && (
                <div className="w-full sm:w-60">
                  <input
                    type="text"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    placeholder="Search services…"
                    className="w-full px-3 py-1.5 text-xs rounded-btn border border-ink-400 bg-surface focus:outline-none focus:ring-2 focus:ring-moss-700"
                  />
                </div>
              )}
            </div>

            {/* Services Table */}
            <div className="border border-sand-200 rounded-btn overflow-hidden">
              <table className="w-full text-left text-sm divide-y divide-sand-200">
                <thead className="bg-sand-100 text-xs font-semibold text-ink-700">
                  <tr>
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4 text-right">Indicative Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 bg-surface">
                  {visibleServices.map((srv, idx) => (
                    <tr key={idx} className="hover:bg-sand-100/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-ink-900">{srv.name}</div>
                        {srv.description && (
                          <div className="text-xs text-ink-500 mt-0.5">{srv.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-ink-900 tabular-nums">
                        {srv.fromPrice !== undefined && srv.fromPrice > 0 ? (
                          <>From {formatCurrencyINR(srv.fromPrice)}</>
                        ) : srv.fromPrice === 0 ? (
                          <span className="text-moss-700 font-bold">Free / Subsidised</span>
                        ) : (
                          <span className="text-ink-500 text-xs font-normal">On Enquiry</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expand / Collapse for 40+ services */}
            {displayedServices.length > 10 && (
              <button
                type="button"
                onClick={() => setShowAllServices(!showAllServices)}
                className="text-xs font-semibold text-moss-700 hover:underline"
              >
                {showAllServices
                  ? 'Show fewer services'
                  : `Show all ${displayedServices.length} services`}
              </button>
            )}
          </section>

          {/* 5. Facilities & Equipment */}
          {provider.facilities && provider.facilities.length > 0 && (
            <section className="bg-surface rounded-card border border-sand-200 p-6 shadow-subtle space-y-3">
              <h2 className="font-serif text-xl font-bold text-ink-900">On-Site Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {provider.facilities.map((fac, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-btn bg-sand-100 text-xs font-medium text-ink-900"
                  >
                    <CheckCircle2 className="w-4 h-4 text-moss-700 shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. Photo Gallery */}
          <section className="bg-surface rounded-card border border-sand-200 p-6 shadow-subtle space-y-4">
            <h2 className="font-serif text-xl font-bold text-ink-900">Facility Photos</h2>
            {provider.photos && provider.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider.photos.map((src, i) => (
                  <div
                    key={i}
                    className="aspect-4/3 rounded-lg overflow-hidden bg-sand-100 border border-sand-200"
                  >
                    <img
                      src={src}
                      alt={`${provider.name} view ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-sand-100 rounded-btn border border-sand-200">
                <SpeciesPictogram species={provider.animals[0] || 'dog'} size="lg" />
                <p className="text-xs text-ink-500 mt-2">
                  No photographic media provided yet by this facility.
                </p>
              </div>
            )}
          </section>

          {/* 7. How We Verified This Provider */}
          <section
            id="verification-section"
            className="bg-moss-50/70 border border-moss-700/20 rounded-card p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-moss-800">
              <ShieldCheck className="w-5 h-5 text-moss-700 shrink-0" />
              <h2 className="font-serif text-lg font-bold">Verification Details</h2>
            </div>
            <p className="text-sm text-ink-700 leading-relaxed">
              This listing holds a <strong>{provider.verification.toUpperCase()}</strong> status, last re-checked on{' '}
              <strong>{provider.lastVerifiedAt}</strong>.
            </p>
            <ul className="text-xs text-ink-700 space-y-1.5 list-disc pl-5">
              <li>Verified clinic trade licence / state veterinary council registration</li>
              <li>Active telephone number and emergency dispatch readiness check</li>
              <li>Operational hours and emergency triage confirmed with clinic admin</li>
            </ul>
          </section>

          {/* 8. Trust & Community Actions: Submit a Correction & Claim */}
          <section className="border-t border-sand-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-ink-900">
                Notice something out of date?
              </h4>
              <p className="text-xs text-ink-500">
                In a directory, trust is the product. Corrections are reviewed within 2 working days.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCorrection(provider)}
                className="border-ink-400 text-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-moss-700" />
                <span>Submit a Correction</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClaim}
                className="text-xs text-ink-700"
              >
                <span>Claim Listing</span>
              </Button>
            </div>
          </section>

          {/* 9. Nearby Alternatives (3) */}
          <section className="space-y-4 pt-6 border-t border-sand-200">
            <h2 className="font-serif text-xl font-bold text-ink-900">
              Nearby Alternatives in {provider.address.city}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {nearbyAlternatives.map((alt) => (
                <ProviderCard key={alt.id} provider={alt} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Sticky Quick Info Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-surface rounded-card border border-sand-200 p-5 shadow-subtle space-y-4">
            <h3 className="font-serif text-base font-bold text-ink-900 border-b border-sand-200 pb-3">
              Location & Quick Contact
            </h3>

            <div className="space-y-3 text-sm text-ink-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-moss-700 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-medium text-ink-900">{provider.address.area}</p>
                  <p className="text-xs text-ink-500">{provider.address.line}</p>
                  <p className="text-xs text-ink-500 font-mono">Pincode: {provider.address.pincode}</p>
                </div>
              </div>

              {provider.address.parkingAvailable !== undefined && (
                <div className="flex items-center gap-2.5 text-xs text-ink-700">
                  <Car className="w-4 h-4 text-moss-700 shrink-0" strokeWidth={1.5} />
                  <span>
                    {provider.address.parkingAvailable
                      ? 'Dedicated animal patient parking on premises'
                      : 'Street parking only'}
                  </span>
                </div>
              )}

              {provider.phone && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-ink-900 pt-1">
                  <Phone className="w-4 h-4 text-moss-700 shrink-0" strokeWidth={1.5} />
                  <span className="tabular-nums font-mono">{provider.phone}</span>
                </div>
              )}
            </div>

            {/* Action buttons inside sidebar for desktop */}
            {provider.status !== 'permanently_closed' && (
              <div className="pt-3 border-t border-sand-200 space-y-2">
                {provider.phone ? (
                  <Button variant="primary" fullWidth size="md" onClick={handleCall}>
                    <Phone className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    <span>Call Provider</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    fullWidth
                    size="md"
                    onClick={() => openCorrection(provider)}
                    className="border-ink-400 text-xs"
                  >
                    <span>Phone not listed &bull; Submit</span>
                  </Button>
                )}

                <Button variant="secondary" fullWidth size="md" onClick={handleDirections}>
                  <Navigation className="w-4 h-4 mr-2 text-moss-700" strokeWidth={1.5} />
                  <span>Get Directions (Maps)</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar (Call · WhatsApp · Directions) */}
      {provider.status !== 'permanently_closed' && (
        <aside
          aria-label="Contact options"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-sm border-t border-sand-200 p-3 shadow-floating flex items-center gap-2"
        >
          {provider.phone ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleCall}
              className="flex-1 font-bold text-white bg-moss-700"
            >
              <Phone className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
              <span>Call</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={() => openCorrection(provider)}
              className="flex-1 text-xs border-ink-400"
            >
              <span>Phone missing</span>
            </Button>
          )}

          <Button variant="secondary" size="md" onClick={handleDirections} className="px-3.5">
            <Navigation className="w-4 h-4 text-moss-700" strokeWidth={1.5} />
            <span className="text-xs font-semibold">Directions</span>
          </Button>

          {(provider.whatsapp || provider.phone) && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleWhatsApp}
              className="px-3.5"
              aria-label="WhatsApp enquiry"
            >
              <MessageCircle className="w-4 h-4 text-[#128C7E]" strokeWidth={1.5} />
            </Button>
          )}
        </aside>
      )}
    </div>
  );
};
