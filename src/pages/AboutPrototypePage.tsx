import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Wifi,
  WifiOff,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone,
  BarChart3,
  Sliders,
  ShieldCheck,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useDemo } from '../context/DemoContext';
import { getRecordedEvents, EventRecord } from '../utils/analytics';

export const AboutPrototypePage: React.FC = () => {
  const {
    clockOverride,
    setClockOverride,
    locationState,
    setLocationState,
    selectedCity,
    setSelectedCity,
    networkState,
    setNetworkState,
    latencyMs,
    setLatencyMs,
    showToast,
  } = useDemo();

  const [recentEvents, setRecentEvents] = useState<EventRecord[]>([]);

  useEffect(() => {
    setRecentEvents(getRecordedEvents());
    const handleEventLogged = () => {
      setRecentEvents(getRecordedEvents());
    };
    window.addEventListener('practo_analytics_event', handleEventLogged);
    return () => window.removeEventListener('practo_analytics_event', handleEventLogged);
  }, []);

  return (
    <div className="min-h-screen bg-paper pb-24">
      {/* Header */}
      <header className="bg-surface border-b border-sand-200 py-10 px-4 sm:px-6">
        <div className="max-w-container mx-auto space-y-3">
          <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
            Staff Product Designer & Front-End Evaluation
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink-900">
            About This Prototype
          </h1>
          <p className="text-base sm:text-lg text-ink-700 max-w-prose">
            Design decisions, system tokens, architectural trade-offs, and product mechanics for "Practo for Animals".
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-container mx-auto px-4 sm:px-6 pt-10 space-y-12">
        
        {/* DEMO CONTROLS (P2) */}
        <section
          aria-label="Simulation controls"
          className="bg-surface rounded-hero border-2 border-moss-700/30 p-6 sm:p-8 shadow-floating space-y-6"
        >
          <div className="flex items-center justify-between border-b border-sand-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-moss-50 border border-moss-700/20 text-moss-700 flex items-center justify-center">
                <Sliders className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-ink-900">
                  Interactive Demo Controls [P2]
                </h2>
                <p className="text-xs text-ink-500">
                  Simulate operational states to test computed open statuses, edge cases, and offline fallbacks.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Override Clock */}
            <div className="space-y-2">
              <label className="text-xs font-semibold overline text-ink-700 block">
                Time Override (Asia/Kolkata)
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: null, label: 'Live Clock' },
                  { id: '10:00', label: '10:00 am (Morning)' },
                  { id: '21:00', label: '09:00 pm (Closing)' },
                  { id: '02:00', label: '02:00 am (Night)' },
                ].map((item) => (
                  <button
                    key={String(item.id)}
                    type="button"
                    onClick={() => {
                      setClockOverride(item.id);
                      showToast(`Clock set to ${item.label}`, 'info');
                    }}
                    className={`p-2 rounded-btn border text-xs font-semibold text-center transition-colors ${
                      clockOverride === item.id
                        ? 'bg-moss-700 text-white border-moss-700'
                        : 'bg-sand-100 border-sand-200 text-ink-700 hover:bg-sand-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-ink-500">
                Notice how cards immediately recompute: "Open now", "Closing soon", "Open 24×7", or night clinics.
              </p>
            </div>

            {/* 2. City / Location */}
            <div className="space-y-2">
              <label className="text-xs font-semibold overline text-ink-700 block">
                Active City
              </label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {['Bengaluru', 'Mumbai', 'Delhi NCR'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`p-2 rounded-btn border text-xs font-semibold transition-colors ${
                      selectedCity === city
                        ? 'bg-moss-700 text-white border-moss-700'
                        : 'bg-sand-100 border-sand-200 text-ink-700 hover:bg-sand-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-ink-500">
                Dynamically re-centers directory results, distance calculations, and coordinates.
              </p>
            </div>

            {/* 3. Network Simulation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold overline text-ink-700 block">
                Network State
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setNetworkState('online');
                    showToast('Network restored online', 'success');
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-btn border text-xs font-semibold transition-colors ${
                    networkState === 'online'
                      ? 'bg-moss-700 text-white border-moss-700'
                      : 'bg-sand-100 border-sand-200 text-ink-700'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNetworkState('offline');
                    showToast('Simulating offline network state', 'alert');
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-btn border text-xs font-semibold transition-colors ${
                    networkState === 'offline'
                      ? 'bg-alert-700 text-white border-alert-700'
                      : 'bg-sand-100 border-sand-200 text-ink-700'
                  }`}
                >
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline</span>
                </button>
              </div>
              <p className="text-[11px] text-ink-500">
                Tests cached result display and vector SVG fallback map.
              </p>
            </div>

            {/* 4. Simulated Latency */}
            <div className="space-y-2">
              <label className="text-xs font-semibold overline text-ink-700 block">
                Simulated Latency
              </label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {[
                  { ms: 0, label: '0ms' },
                  { ms: 300, label: '300ms' },
                  { ms: 1000, label: '1000ms' },
                ].map((item) => (
                  <button
                    key={item.ms}
                    type="button"
                    onClick={() => setLatencyMs(item.ms)}
                    className={`p-2 rounded-btn border text-xs font-semibold transition-colors ${
                      latencyMs === item.ms
                        ? 'bg-moss-700 text-white border-moss-700'
                        : 'bg-sand-100 border-sand-200 text-ink-700 hover:bg-sand-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-ink-500">
                Tests zero layout-shift card skeletons and shimmer effects.
              </p>
            </div>
          </div>
        </section>

        {/* 1. The Five Moments */}
        <section className="bg-surface rounded-card border border-sand-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
              Product Architecture
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink-900">
              The Five Moments of Animal Discovery
            </h2>
            <p className="text-sm text-ink-500">
              Every screen, CTA, and hierarchy was designed to serve one of these five specific human-animal moments:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
            {[
              {
                num: '1',
                title: 'EMERGENCY',
                quote: '"My dog is hurt, who is open right now?"',
                focus: 'Speed, 24×7 status, >=56px one-tap call button, GPS geolocation gate.',
                accent: 'border-alert-700/40 bg-alert-100/30 text-alert-700',
              },
              {
                num: '2',
                title: 'PLANNED',
                quote: '"Vaccination, boarding, diagnostics, check-up"',
                focus: 'Compare, distance, species badges, indicative fee tables, verified schedules.',
                accent: 'border-moss-700/30 bg-moss-50/50 text-moss-800',
              },
              {
                num: '3',
                title: 'RESCUE',
                quote: '"I found an injured stray dog on the road"',
                focus: 'Shelters, ambulances with oxygen, non-profit ABC centres, donation tags.',
                accent: 'border-saffron-500/40 bg-saffron-100/30 text-ink-900',
              },
              {
                num: '4',
                title: 'SUPPLY',
                quote: '"An owner wants their clinic or boarding listed"',
                focus: 'Free listing stepper, draft autosave to localStorage, duplicate detection.',
                accent: 'border-sand-200 bg-sand-100/50 text-ink-900',
              },
              {
                num: '5',
                title: 'DATA QUALITY',
                quote: '"Anyone spots wrong info on hours or phone"',
                focus: 'In a directory, trust is the product. 2-day turnaround promise & reference ID.',
                accent: 'border-sand-200 bg-sand-100/50 text-ink-900',
              },
            ].map((m) => (
              <div key={m.num} className={`p-4 rounded-card border ${m.accent} flex flex-col justify-between space-y-3`}>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider block">
                    {m.num}. {m.title}
                  </span>
                  <p className="font-serif text-sm font-bold leading-snug">{m.quote}</p>
                </div>
                <p className="text-xs text-ink-700 leading-relaxed">{m.focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. MVP In vs MVP Out Table */}
        <section className="bg-surface rounded-card border border-sand-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
              Scope Discipline
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink-900">
              MVP Scope Definition
            </h2>
            <p className="text-sm text-ink-500">
              Disciplined boundaries ensure speed and bulletproof trust before expanding footprint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MVP IN */}
            <div className="p-5 rounded-btn bg-moss-50/70 border border-moss-700/20 space-y-3">
              <div className="flex items-center gap-2 text-moss-800">
                <CheckCircle2 className="w-5 h-5 text-moss-700" />
                <h3 className="font-serif text-lg font-bold">MVP IN (Delivered in this prototype)</h3>
              </div>
              <ul className="text-xs text-ink-700 space-y-2 list-disc pl-5">
                <li>Search with typo-tolerance and filter syncing to URL query params</li>
                <li>Sticky filter rail (&ge; 1024px) and interactive Leaflet OpenStreetMap</li>
                <li>Comprehensive provider profiles with 24-hour visual timeline bars</li>
                <li>Call, WhatsApp, and Google Maps Turn-by-Turn directions</li>
                <li>Emergency mode with 8-second GPS timeout and radius widening</li>
                <li>List Your Business 4-step stepper with draft autosave and duplicate check</li>
                <li>Submit a Correction modal with proof upload and reference IDs</li>
                <li>Three-tiered verification system with "Last verified" stamps</li>
                <li>Warm Clinical tokens with WCAG 2.2 AA contrast adherence</li>
              </ul>
            </div>

            {/* MVP OUT (Later) */}
            <div className="p-5 rounded-btn bg-sand-100/60 border border-sand-200 space-y-3">
              <div className="flex items-center gap-2 text-ink-700">
                <Clock className="w-5 h-5 text-ink-500" />
                <h3 className="font-serif text-lg font-bold">MVP OUT (Roadmap &bull; "Later")</h3>
              </div>
              <ul className="text-xs text-ink-500 space-y-2 list-disc pl-5">
                <li>Instant appointment booking engine & clinic calendar sync</li>
                <li>Native payment gateway (UPI, Netbanking) for consultation advance</li>
                <li>Verified patient reviews and moderation queue</li>
                <li>Telehealth video consultations for non-critical triage</li>
                <li>Digital pet health records and vaccination passbook</li>
                <li>E-pharmacy prescription delivery</li>
                <li>AI triage chatbot / automated symptoms checker</li>
                <li>SaaS provider dashboard for clinic analytics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. CTA Hierarchy & Success Metrics */}
        <section className="bg-surface rounded-card border border-sand-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
              Conversion Strategy
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink-900">
              CTA Hierarchy & Measurable Success Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm text-ink-700">
              <h3 className="font-bold text-ink-900">Strict CTA Rules Implemented:</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <strong>Primary CTA:</strong> "Find a Vet" follows the selected category ("Find a Hospital", "Find Boarding", "Find a Lab", etc.). On search results cards, primary CTA is "Call".
                </li>
                <li>
                  <strong>Secondary CTAs:</strong> "Directions", "WhatsApp", and "Explore Services".
                </li>
                <li>
                  <strong>Supply CTA:</strong> "List Your Business" (header outline, home band, footer).
                </li>
                <li>
                  <strong>Data Quality CTA:</strong> "Submit a Correction" on every listing.
                </li>
                <li>
                  <strong>Emergency CTA:</strong> Red alert button in header on every route.
                </li>
                <li>
                  <strong>Single-primary Rule:</strong> Only one filled primary button per viewport region.
                </li>
              </ul>
            </div>

            <div className="space-y-3 text-sm text-ink-700">
              <h3 className="font-bold text-ink-900">Success Metrics (Instrumented):</h3>
              <div className="bg-sand-100 p-4 rounded-btn border border-sand-200 space-y-2 text-xs">
                <p>
                  <strong>North Star Metric:</strong> Contact actions (Call + WhatsApp + Directions) per search session.
                </p>
                <p>
                  <strong>Secondary Metric 1:</strong> Document-verified listing coverage (% of total listings with verified licence).
                </p>
                <p>
                  <strong>Secondary Metric 2:</strong> Correction turnaround time &le; 48 hours.
                </p>
                <p>
                  <strong>Secondary Metric 3:</strong> New business listings onboarded per week.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Live Telemetry Event Stream */}
        <section className="bg-surface rounded-card border border-sand-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-moss-700">
              <Terminal className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-ink-900">
                Live Telemetry Event Inspector ({recentEvents.length} events logged)
              </h3>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('practo_animals_events_log');
                setRecentEvents([]);
                showToast('Telemetry log cleared', 'info');
              }}
              className="text-xs text-ink-500 hover:text-ink-900 underline"
            >
              Clear log
            </button>
          </div>

          <p className="text-xs text-ink-500">
            Every CTA click triggers a structured <code className="font-mono text-moss-700">track(event, props)</code> call logged to the browser console and recorded below:
          </p>

          <div className="max-h-60 overflow-y-auto bg-sand-100/80 rounded-btn p-3 border border-sand-200 font-mono text-xs space-y-2">
            {recentEvents.length === 0 ? (
              <p className="text-ink-500 italic py-2 text-center">
                No events recorded in this session yet. Click any button or filter to inspect live telemetry.
              </p>
            ) : (
              recentEvents.map((evt, idx) => (
                <div key={idx} className="p-2 rounded bg-surface border border-sand-200 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-bold text-moss-700">{evt.event}</span>
                    <span className="text-[11px] text-ink-500 ml-2">
                      {JSON.stringify(evt.props)}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-400 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 5. Assumptions & Notice */}
        <section className="border-t border-sand-200 pt-6 text-xs text-ink-500 space-y-2">
          <h4 className="font-bold text-ink-700 text-sm">Assumptions & Sample Notice:</h4>
          <p>
            All provider names, telephone numbers, and ratings in this assignment are fictional sample data constructed across Bengaluru, Mumbai, and Delhi NCR to stress-test 16 distinct operational and data edge cases (including 24×7 hospitals with separate OPD hours, night clinics, clinics closed at present, listings with zero reviews, 40+ services, and unverified entries).
          </p>
        </section>
      </main>
    </div>
  );
};
