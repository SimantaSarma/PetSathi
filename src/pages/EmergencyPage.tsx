import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Phone,
  Navigation,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Info,
  Ambulance,
  Heart,
  PlusCircle,
} from 'lucide-react';
import { SAMPLE_PROVIDERS } from '../data/providers';
import { Provider } from '../types';
import { Button } from '../components/ui/Button';
import { SpeciesPictogram } from '../components/ui/SpeciesPictogram';
import { calculateDistanceKm } from '../utils/distance';
import { formatDistance } from '../utils/formatters';
import { track } from '../utils/analytics';
import { useDemo } from '../context/DemoContext';

export const EmergencyPage: React.FC = () => {
  const { userCoords, setUserCoords, selectedCity, setSelectedCity, showToast } = useDemo();

  // Location Gate States
  const [locGateStatus, setLocGateStatus] = useState<
    'prompt' | 'requesting' | 'granted' | 'timeout' | 'denied'
  >('prompt');
  const [manualPincode, setManualPincode] = useState('');
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Auto-radius widening
  const [autoWidenedNotice, setAutoWidenedNotice] = useState<boolean>(false);

  // Request browser geolocation with 8s timeout as specified
  const requestLocation = () => {
    setLocGateStatus('requesting');
    track('emergency_open', { action: 'request_location_start' });

    if (!('geolocation' in navigator)) {
      setLocGateStatus('denied');
      return;
    }

    const timer = setTimeout(() => {
      setLocGateStatus('timeout');
      showToast('Location request timed out. Please enter your 6-digit pincode below.', 'alert');
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocGateStatus('granted');
        track('emergency_open', { action: 'location_granted' });
      },
      (err) => {
        clearTimeout(timer);
        setLocGateStatus('denied');
        track('emergency_open', { action: 'location_denied', code: err.code });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleManualPincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeError(null);
    const cleaned = manualPincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
      setPincodeError('Please enter a valid 6-digit Indian postal pincode (e.g. 560034).');
      return;
    }

    // Map common pincode prefixes to test coordinates
    if (cleaned.startsWith('56')) {
      setSelectedCity('Bengaluru');
      setUserCoords({ lat: 12.9345, lng: 77.6255 });
    } else if (cleaned.startsWith('40')) {
      setSelectedCity('Mumbai');
      setUserCoords({ lat: 19.0558, lng: 72.8315 });
    } else if (cleaned.startsWith('11') || cleaned.startsWith('12') || cleaned.startsWith('20')) {
      setSelectedCity('Delhi NCR');
      setUserCoords({ lat: 28.5244, lng: 77.1557 });
    } else {
      // Unsupported city edge case
      setPincodeError(
        `We do not have active emergency verified partners in pincode ${cleaned} yet. Showing nearest emergency network in Bengaluru.`
      );
      setSelectedCity('Bengaluru');
      setUserCoords({ lat: 12.9345, lng: 77.6255 });
    }

    setLocGateStatus('granted');
    track('emergency_open', { action: 'manual_pincode_submit', pincode: cleaned });
  };

  // Group providers by Emergency Category:
  // 1. "Emergency-ready now" (24x7, or open with emergency flag)
  // 2. Ambulances
  // 3. NGOs
  const { emergencyReady, ambulances, ngos, effectiveRadiusKm } = useMemo(() => {
    let radius = 15; // start with 15km

    const filterWithRadius = (r: number) => {
      const eReady: { provider: Provider; dist: number }[] = [];
      const ambs: { provider: Provider; dist: number }[] = [];
      const ngoList: { provider: Provider; dist: number }[] = [];

      SAMPLE_PROVIDERS.forEach((prov) => {
        if (prov.status === 'permanently_closed' || prov.status === 'temporarily_closed') {
          return;
        }

        const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, prov.address.lat, prov.address.lng);
        if (dist > r) return;

        const isAmbulance = prov.types.includes('ambulance');
        const isNgo = prov.types.includes('ngo');
        const is24x7Hospital =
          prov.hours?.is24x7 ||
          prov.hours?.emergency === '24x7' ||
          prov.types.includes('animal_hospital');

        if (isAmbulance) {
          ambs.push({ provider: prov, dist });
        } else if (isNgo) {
          ngoList.push({ provider: prov, dist });
        } else if (is24x7Hospital) {
          eReady.push({ provider: prov, dist });
        }
      });

      eReady.sort((a, b) => a.dist - b.dist);
      ambs.sort((a, b) => a.dist - b.dist);
      ngoList.sort((a, b) => a.dist - b.dist);

      return { eReady, ambs, ngoList };
    };

    let result = filterWithRadius(radius);

    // If nothing within 15 km -> auto-widen to 30 km with a notice
    if (result.eReady.length === 0 && result.ambs.length === 0 && result.ngoList.length === 0) {
      radius = 30;
      result = filterWithRadius(radius);
      setAutoWidenedNotice(true);
    } else {
      setAutoWidenedNotice(false);
    }

    return {
      emergencyReady: result.eReady,
      ambulances: result.ambs,
      ngos: result.ngoList,
      effectiveRadiusKm: radius,
    };
  }, [userCoords]);

  const handleCall = (prov: Provider) => {
    track('call_click', {
      providerId: prov.id,
      providerName: prov.name,
      phone: prov.phone,
      mode: 'emergency',
    });
    if (prov.phone) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (!isMobile) {
        navigator.clipboard.writeText(prov.phone);
        showToast(`Copied emergency number ${prov.phone} to clipboard`, 'success');
      } else {
        window.location.href = `tel:${prov.phone.replace(/\s+/g, '')}`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper pb-24">
      
      {/* Red Emergency Header Alert */}
      <section className="bg-alert-700 text-white py-8 px-4 sm:px-6 shadow-floating">
        <div className="max-w-container mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>24×7 Emergency Dispatch & Trauma Care</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-none">
            Animal Emergency Network
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed">
            Direct emergency access for acute trauma, bleeding, toxic ingestion, road hits, and respiratory distress.
          </p>

          {/* Critical instruction note as requested */}
          <div className="p-3.5 bg-black/20 rounded-btn text-xs sm:text-sm border border-white/20 flex items-center gap-2.5 max-w-xl">
            <Info className="w-5 h-5 shrink-0 text-white" strokeWidth={2} />
            <span>
              <strong>Call ahead:</strong> Tell the hospital your animal species, the exact problem, and your estimated arrival time (ETA) so they prep the oxygen or surgical OT.
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-container mx-auto px-4 sm:px-6 pt-6 space-y-8">
        
        {/* Location Gate Box */}
        {locGateStatus !== 'granted' ? (
          <section
            aria-label="Location permission"
            className="bg-surface rounded-card border-2 border-moss-700/30 p-6 sm:p-8 max-w-xl mx-auto shadow-floating text-center space-y-5"
          >
            <div className="w-14 h-14 bg-moss-50 text-moss-700 rounded-full flex items-center justify-center mx-auto border border-moss-600/30">
              <MapPin className="w-7 h-7" strokeWidth={1.5} />
            </div>
            
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900">
                Where is the emergency?
              </h2>
              <p className="text-sm text-ink-500 max-w-md mx-auto">
                Seconds matter. Share your GPS location so we instantly list the closest open 24×7 hospitals and ambulances.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="emergency-lg"
                fullWidth
                onClick={requestLocation}
                disabled={locGateStatus === 'requesting'}
                className="font-bold bg-moss-700 text-white min-h-[56px] text-lg"
              >
                {locGateStatus === 'requesting' ? (
                  <span>Detecting GPS Location (8s timeout)…</span>
                ) : (
                  <span>Use My Current Location</span>
                )}
              </Button>

              <div className="text-xs text-ink-500 flex items-center justify-center gap-2">
                <span className="h-px bg-sand-200 flex-1" />
                <span>or enter postal code</span>
                <span className="h-px bg-sand-200 flex-1" />
              </div>

              {/* Manual Pincode Form */}
              <form onSubmit={handleManualPincodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={manualPincode}
                  onChange={(e) => setManualPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 p-3 rounded-btn border border-ink-400 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-moss-700 text-center font-mono font-bold tracking-widest"
                />
                <Button variant="secondary" size="md" type="submit" className="font-semibold">
                  Go
                </Button>
              </form>

              {pincodeError && (
                <p className="text-xs text-alert-700 font-medium text-left bg-alert-100 p-2.5 rounded-btn border border-alert-700/20">
                  {pincodeError}
                </p>
              )}
            </div>

            <p className="text-[11px] text-ink-500">
              Your location coordinates are processed strictly client-side to calculate driving distances.
            </p>
          </section>
        ) : (
          /* Location Granted: Emergency Listings View */
          <div className="space-y-8">
            
            {/* Auto-widened notification if nothing was found within 15 km */}
            {autoWidenedNotice && (
              <aside
                aria-label="Search radius notice"
                className="bg-amber-100 border border-amber-800/30 text-amber-800 p-4 rounded-btn flex items-center justify-between gap-4 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>
                    No emergency facilities found within 15 km of your location. We have automatically expanded search radius to <strong>30 km</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLocGateStatus('prompt')}
                  className="shrink-0 underline font-semibold hover:no-underline"
                >
                  Change Location
                </button>
              </aside>
            )}

            {/* Change location pill */}
            <div className="flex items-center justify-between text-xs text-ink-700 bg-surface p-3 rounded-btn border border-sand-200">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-moss-700" />
                <span>Showing emergency providers near your location ({selectedCity})</span>
              </span>
              <button
                type="button"
                onClick={() => setLocGateStatus('prompt')}
                className="text-moss-700 font-semibold underline hover:no-underline ml-2"
              >
                Change location
              </button>
            </div>

            {/* Empty state if still nothing within 30 km */}
            {emergencyReady.length === 0 && ambulances.length === 0 && ngos.length === 0 && (
              <div className="bg-surface rounded-card border border-sand-200 p-8 text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-alert-700 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-ink-900">
                  No 24×7 emergency providers registered within 30 km
                </h3>
                <p className="text-sm text-ink-500 max-w-md mx-auto">
                  Our nearest covered emergency network is located in <strong>Bengaluru</strong>.
                </p>
                <div className="pt-2">
                  <Link to="/list-your-business">
                    <Button variant="outline" size="md">
                      <PlusCircle className="w-4 h-4 mr-2 text-moss-700" />
                      <span>Know a 24×7 provider here? Add it</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* 1. Emergency-Ready Now (24×7 Hospitals) */}
            {emergencyReady.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="overline text-xs font-semibold text-alert-700 tracking-wider">
                      Immediate In-Patient Care
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900">
                      Emergency-Ready Hospitals (24×7)
                    </h2>
                  </div>
                  <span className="text-xs bg-alert-100 text-alert-700 font-bold px-2.5 py-1 rounded-pill border border-alert-700/30">
                    {emergencyReady.length} Open Now
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergencyReady.map(({ provider, dist }) => (
                    <div
                      key={provider.id}
                      className="bg-surface rounded-card border-2 border-alert-700/20 hover:border-alert-700 p-5 shadow-floating flex flex-col justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-alert-700 bg-alert-100 px-2.5 py-0.5 rounded-pill border border-alert-700/30">
                            Open 24×7 Emergency
                          </span>
                          <span className="text-xs font-bold text-ink-900 tabular-nums">
                            {formatDistance(dist)} away
                          </span>
                        </div>
                        <Link to={`/provider/${provider.slug}`}>
                          <h3 className="font-serif text-lg font-bold text-ink-900 hover:text-moss-700 transition-colors">
                            {provider.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-ink-500">
                          {provider.address.area}, {provider.address.city}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-ink-500 font-medium">Species:</span>
                          {provider.animals.map((sp) => (
                            <SpeciesPictogram key={sp} species={sp} size="sm" />
                          ))}
                        </div>
                      </div>

                      {/* CALL BUTTON >= 56px high as required by specification */}
                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          variant="emergency"
                          size="emergency-lg"
                          fullWidth
                          onClick={() => handleCall(provider)}
                          className="font-bold text-lg min-h-[56px] shadow-floating"
                        >
                          <Phone className="w-5 h-5 mr-2" strokeWidth={2} />
                          <span>Call 24×7 Emergency</span>
                        </Button>
                        <Link to={`/provider/${provider.slug}`}>
                          <Button variant="secondary" size="emergency-lg" className="px-4 min-h-[56px]">
                            <Navigation className="w-5 h-5 text-moss-700" strokeWidth={1.5} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Rapid Ambulances */}
            {ambulances.length > 0 && (
              <section className="space-y-4 pt-4 border-t border-sand-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
                      Mobile Trauma Transit
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900">
                      Animal Ambulances
                    </h2>
                  </div>
                  <span className="text-xs bg-moss-50 text-moss-800 font-bold px-2.5 py-1 rounded-pill border border-moss-700/30">
                    {ambulances.length} Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ambulances.map(({ provider, dist }) => (
                    <div
                      key={provider.id}
                      className="bg-surface rounded-card border border-sand-200 hover:border-moss-700 p-5 shadow-subtle flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-moss-800 bg-moss-50 px-2.5 py-0.5 rounded-pill border border-moss-700/20">
                            {provider.typeSpecific?.hasOxygen ? 'Oxygen Equipped' : 'Animal Ambulance'}
                          </span>
                          <span className="text-xs font-bold text-ink-900 tabular-nums">
                            {formatDistance(dist)} away
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-ink-900">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-ink-500">
                          Coverage: Up to {provider.typeSpecific?.coverageKm || 25} km radius
                        </p>
                      </div>

                      {/* CALL BUTTON >= 56px high */}
                      <Button
                        variant="primary"
                        size="emergency-lg"
                        fullWidth
                        onClick={() => handleCall(provider)}
                        className="font-bold text-lg min-h-[56px] bg-moss-700 text-white"
                      >
                        <Phone className="w-5 h-5 mr-2" strokeWidth={2} />
                        <span>Call Dispatcher</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Stray Rescue & NGOs */}
            {ngos.length > 0 && (
              <section className="space-y-4 pt-4 border-t border-sand-200">
                <div className="space-y-0.5">
                  <span className="overline text-xs font-semibold text-ink-500 tracking-wider">
                    Community & Stray Aid
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900">
                    Rescue NGOs & Shelters
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ngos.map(({ provider, dist }) => (
                    <div
                      key={provider.id}
                      className="bg-surface rounded-card border border-sand-200 p-5 shadow-subtle flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-ink-700 bg-sand-100 px-2 py-0.5 rounded">
                            Rescue NGO
                          </span>
                          <span className="text-xs font-semibold text-ink-900 tabular-nums">
                            {formatDistance(dist)} away
                          </span>
                        </div>
                        <h3 className="font-serif text-base font-bold text-ink-900">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-ink-500">
                          Focus: {provider.typeSpecific?.causes?.join(', ')}
                        </p>
                      </div>

                      {/* CALL BUTTON >= 56px */}
                      <Button
                        variant="secondary"
                        size="emergency-lg"
                        fullWidth
                        onClick={() => handleCall(provider)}
                        className="font-bold text-base min-h-[56px]"
                      >
                        <Phone className="w-5 h-5 mr-2 text-moss-700" strokeWidth={1.5} />
                        <span>Call Rescue Helpline</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
