import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Phone,
  Clock,
  Heart,
  Navigation,
  MessageCircle,
  PlusCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Crosshair,
  Building,
  Ambulance,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProviderCard } from '../components/provider/ProviderCard';
import { ProviderCardSkeleton } from '../components/provider/ProviderCardSkeleton';
import { SAMPLE_PROVIDERS } from '../data/providers';
import { ProviderType, AnimalSpecies } from '../types';
import { track } from '../utils/analytics';
import { useDemo } from '../context/DemoContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity, setSelectedCity, userCoords, setUserCoords, showToast } = useDemo();

  // Hero search state
  const [selectedCategory, setSelectedCategory] = useState<ProviderType | 'all'>('vet_clinic');
  const [whereInput, setWhereInput] = useState<string>(selectedCity);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Dynamic primary CTA label following selected category as strictly required:
  // "Primary: 'Find a Vet' — the label follows the selected category (Find a Hospital / Find Boarding / Find a Lab / Find an Ambulance / Find an NGO)."
  const primaryCtaLabel = {
    all: 'Find Care',
    vet_clinic: 'Find a Vet',
    animal_hospital: 'Find a Hospital',
    boarding: 'Find Boarding',
    diagnostics: 'Find a Lab',
    ambulance: 'Find an Ambulance',
    ngo: 'Find an NGO',
  }[selectedCategory];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    track('search_submit', {
      category: selectedCategory,
      location: whereInput,
      source: 'hero_search_card',
    });
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('type', selectedCategory);
    if (whereInput && whereInput !== 'All') params.set('city', whereInput);
    navigate(`/search?${params.toString()}`);
  };

  const handleUseMyLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('Geolocation not supported by this browser', 'alert');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        showToast('Location updated to your GPS coordinates', 'success');
      },
      () => {
        setIsDetectingLocation(false);
        showToast('Unable to fetch GPS. You can enter your pincode or city manually.', 'alert');
      },
      { timeout: 6000 }
    );
  };

  // Preview provider for right hero column (demonstrates verification stamp, open status, Call/WhatsApp/Directions)
  const heroPreviewProvider = SAMPLE_PROVIDERS[0]; // Sanjivani 24x7 Koramangala

  // 4 Cards for "Open near you now"
  const openNearYou = SAMPLE_PROVIDERS.filter((p) => p.status === 'open' && p.hours?.is24x7).slice(0, 4);

  return (
    <div className="min-h-screen bg-paper">
      
      {/* 2. Hero (Asymmetric 7/5 Grid) */}
      <section className="relative pt-6 pb-12 md:py-16 px-4 md:px-6 border-b border-sand-200 bg-linear-to-b from-sand-100/40 to-paper">
        <div className="max-w-container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Editorial header + Search Card + Quick Chips */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
                Animal care, mapped
              </span>
              <h1 className="font-serif-h1">
                The right care for your animal, found in minutes.
              </h1>
              <p className="text-base sm:text-lg text-ink-700 leading-relaxed max-w-prose">
                Vets, hospitals, boarding, diagnostics, ambulances and rescue NGOs — verified, mapped and one tap from a call.
              </p>
            </div>

            {/* Search Card Container (radius 20) */}
            <div className="bg-surface rounded-hero border border-sand-200 p-5 sm:p-6 shadow-floating space-y-5">
              
              {/* Category Segmented Control (Scrolls with snap on mobile) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar snap-x p-1 bg-sand-100 rounded-lg">
                {[
                  { id: 'vet_clinic', label: 'Vet Clinics' },
                  { id: 'animal_hospital', label: 'Hospitals' },
                  { id: 'boarding', label: 'Boarding' },
                  { id: 'diagnostics', label: 'Diagnostics' },
                  { id: 'ambulance', label: 'Ambulance' },
                  { id: 'ngo', label: 'Rescue NGOs' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as ProviderType)}
                    className={`snap-start shrink-0 px-3.5 py-2 text-xs font-semibold rounded-btn transition-all duration-150 ${
                      selectedCategory === cat.id
                        ? 'bg-surface text-ink-900 shadow-subtle border border-sand-200 font-bold'
                        : 'text-ink-700 hover:text-ink-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Where Input & Primary CTA Form */}
              <form onSubmit={handleHeroSearch} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="hero-where" className="font-semibold text-ink-900">
                      Where do you need care?
                    </label>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="text-moss-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>{isDetectingLocation ? 'Locating…' : 'Use my location'}</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-moss-700" />
                    <input
                      id="hero-where"
                      type="text"
                      value={whereInput}
                      onChange={(e) => setWhereInput(e.target.value)}
                      placeholder="Enter city, neighbourhood or 6-digit pincode"
                      className="w-full pl-10 pr-4 py-3 rounded-btn border border-ink-400 bg-surface text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-moss-700"
                    />
                  </div>
                </div>

                {/* Primary CTA (label follows selected category) */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  className="bg-moss-700 text-white font-bold tracking-tight text-base shadow-subtle"
                >
                  <Search className="w-4 h-4 mr-2" strokeWidth={2} />
                  <span>{primaryCtaLabel}</span>
                </Button>

                {/* Secondary CTA: "Explore Services" text link under hero search */}
                <div className="text-center pt-1">
                  <Link
                    to="/search?service=Vaccination"
                    onClick={() => track('search_submit', { source: 'hero_secondary_text_link' })}
                    className="text-xs text-ink-700 hover:text-moss-700 font-semibold underline hover:no-underline"
                  >
                    Explore Popular Services (Vaccines, Surgery, Diagnostics) &rarr;
                  </Link>
                </div>
              </form>

              {/* Quick Chips Row */}
              <div className="pt-2 border-t border-sand-200">
                <span className="text-xs text-ink-500 font-medium block mb-2">Quick filters:</span>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  <Link
                    to="/search?openNow=1"
                    className="px-3 py-1.5 rounded-pill bg-sand-100 hover:bg-sand-200 text-ink-900 font-medium border border-sand-200"
                  >
                    Open now
                  </Link>
                  <Link
                    to="/search?emergency=1"
                    className="px-3 py-1.5 rounded-pill bg-alert-100 hover:bg-[#F9D6D3] text-alert-700 font-semibold border border-alert-700/30"
                  >
                    24×7
                  </Link>
                  <Link
                    to="/search?service=Home"
                    className="px-3 py-1.5 rounded-pill bg-sand-100 hover:bg-sand-200 text-ink-900 font-medium border border-sand-200"
                  >
                    Home visit
                  </Link>
                  <Link
                    to="/search?animals=dog"
                    className="px-3 py-1.5 rounded-pill bg-sand-100 hover:bg-sand-200 text-ink-900 font-medium border border-sand-200"
                  >
                    Dogs
                  </Link>
                  <Link
                    to="/search?animals=cat"
                    className="px-3 py-1.5 rounded-pill bg-sand-100 hover:bg-sand-200 text-ink-900 font-medium border border-sand-200"
                  >
                    Cats
                  </Link>
                  <Link
                    to="/search?animals=exotic"
                    className="px-3 py-1.5 rounded-pill bg-sand-100 hover:bg-sand-200 text-ink-900 font-medium border border-sand-200"
                  >
                    Exotics
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Emergency Panel + Trust Provider Card Preview */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Signature Detail 1: Emergency Panel (alert-100 surface, alert-700 icon, one-line promise, one-tap action) */}
            <div className="bg-alert-100 border-2 border-alert-700/30 rounded-hero p-6 shadow-floating space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-alert-700 text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 animate-pulse" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <span className="overline text-[11px] font-bold text-alert-700 tracking-wider">
                    Moment 1 &bull; Immediate Emergency
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-900 leading-snug">
                    "My animal is hurt, who is open right now?"
                  </h3>
                  <p className="text-xs text-ink-700 leading-relaxed">
                    One tap to 24×7 hospitals, intensive care OTs, and oxygen ambulances in your city.
                  </p>
                </div>
              </div>

              <Link
                to="/emergency"
                onClick={() => track('emergency_open', { source: 'hero_emergency_panel' })}
              >
                <Button
                  variant="emergency"
                  size="lg"
                  fullWidth
                  className="font-bold tracking-tight text-base bg-alert-700 shadow-subtle min-h-[48px]"
                >
                  <Phone className="w-4 h-4 mr-2" strokeWidth={2} />
                  <span>Open 24×7 Emergency Directory</span>
                </Button>
              </Link>
            </div>

            {/* Provider Card Preview Showing Trust Features */}
            <div className="space-y-2">
              <span className="overline text-[11px] text-ink-500 font-semibold tracking-wider block">
                Featured Verified Facility
              </span>
              <ProviderCard provider={heroPreviewProvider} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Strip (Three Facts) */}
      <section className="bg-surface border-b border-sand-200 py-6 px-4 md:px-6">
        <div className="max-w-container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-moss-50 text-moss-700 flex items-center justify-center shrink-0 border border-moss-700/20">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-ink-900">Always Dated & Verified</h4>
              <p className="text-xs text-ink-500 mt-0.5">
                Every listing displays the exact date it was verified by phone or licence audit.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-moss-50 text-moss-700 flex items-center justify-center shrink-0 border border-moss-700/20">
              <Phone className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-ink-900">Direct One-Tap Connection</h4>
              <p className="text-xs text-ink-500 mt-0.5">
                Call, WhatsApp, or launch GPS turn-by-turn directions directly with zero middlemen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-moss-50 text-moss-700 flex items-center justify-center shrink-0 border border-moss-700/20">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-ink-900">100% Free for Pet Parents</h4>
              <p className="text-xs text-ink-500 mt-0.5">
                No paywalls, hidden booking charges, or gated telephone numbers. Ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Browse by Need — Bento Grid of Six (One Large Tile, Five Small) */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-container mx-auto space-y-8">
          <div className="space-y-2">
            <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
              Care Categories
            </span>
            <h2 className="font-serif-h2">
              Browse animal care by your need
            </h2>
            <p className="text-sm sm:text-base text-ink-500 max-w-prose">
              From routine puppy vaccinations and exotic avian checks to emergency transit and shelter rescues.
            </p>
          </div>

          {/* Bento Grid: 1 large tile, 5 smaller tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            
            {/* 1. Vet Clinics — LARGE TILE (2 cols wide on desktop) */}
            <Link
              to="/search?type=vet_clinic"
              className="md:col-span-2 bg-surface rounded-card border border-sand-200 hover:border-moss-700 p-6 sm:p-8 flex flex-col justify-between shadow-subtle hover:shadow-floating transition-all group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-moss-50 border border-moss-700/20 text-moss-700 flex items-center justify-center group-hover:bg-moss-100 transition-colors">
                  <Building className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-ink-900 group-hover:text-moss-700 transition-colors">
                  Veterinary Clinics
                </h3>
                <p className="text-sm text-ink-700 leading-relaxed max-w-md">
                  General wellness check-ups, preventative immunisations, deworming, dental scaling, microchipping, and minor outpatient procedures.
                </p>
              </div>
              <div className="pt-6 flex items-center justify-between text-xs text-ink-500 font-semibold border-t border-sand-200 mt-6">
                <span>120+ verified clinics</span>
                <span className="text-moss-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Browse Clinics &rarr;
                </span>
              </div>
            </Link>

            {/* 2. Animal Hospitals */}
            <Link
              to="/search?type=animal_hospital"
              className="bg-surface rounded-card border border-sand-200 hover:border-moss-700 p-6 flex flex-col justify-between shadow-subtle hover:shadow-floating transition-all group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-sand-100 text-ink-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-moss-700" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900 group-hover:text-moss-700">
                  Animal Hospitals
                </h3>
                <p className="text-xs text-ink-500 leading-relaxed">
                  24×7 multi-speciality inpatient trauma, critical care ICUs, and complex surgeries.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-moss-700">
                <span>38+ hospitals</span>
                <span>&rarr;</span>
              </div>
            </Link>

            {/* 3. Boarding & Daycare */}
            <Link
              to="/search?type=boarding"
              className="bg-surface rounded-card border border-sand-200 hover:border-moss-700 p-6 flex flex-col justify-between shadow-subtle hover:shadow-floating transition-all group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-sand-100 text-ink-700 flex items-center justify-center">
                  <Home className="w-5 h-5 text-moss-700" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900 group-hover:text-moss-700">
                  Boarding & Daycare
                </h3>
                <p className="text-xs text-ink-500 leading-relaxed">
                  Cage-free resorts, cat suites, live CCTV cameras, and holiday boarding.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-moss-700">
                <span>45+ resorts</span>
                <span>&rarr;</span>
              </div>
            </Link>

            {/* 4. Diagnostics & Labs */}
            <Link
              to="/search?type=diagnostics"
              className="bg-surface rounded-card border border-sand-200 hover:border-moss-700 p-6 flex flex-col justify-between shadow-subtle hover:shadow-floating transition-all group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-sand-100 text-ink-700 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-moss-700" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900 group-hover:text-moss-700">
                  Diagnostics & Labs
                </h3>
                <p className="text-xs text-ink-500 leading-relaxed">
                  Blood chemistry, tick fever PCR panels, digital X-Rays, and home sample collection.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-moss-700">
                <span>28+ labs</span>
                <span>&rarr;</span>
              </div>
            </Link>

            {/* 5. Animal Ambulance (Accent Tile) */}
            <Link
              to="/search?type=ambulance"
              className="bg-alert-100 border border-alert-700/30 hover:border-alert-700 p-6 rounded-card flex flex-col justify-between shadow-subtle hover:shadow-floating transition-all group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-alert-700 text-white flex items-center justify-center">
                  <Ambulance className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900 group-hover:text-alert-700">
                  Animal Ambulance
                </h3>
                <p className="text-xs text-ink-700 leading-relaxed">
                  Oxygen-fitted vehicles, stretchers, and rapid road rescue transit.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-bold text-alert-700">
                <span>Active 24×7</span>
                <span>&rarr;</span>
              </div>
            </Link>

            {/* 6. NGOs & Rescue */}
            <Link
              to="/search?type=ngo"
              className="md:col-span-2 bg-surface rounded-card border border-sand-200 hover:border-moss-700 p-6 flex flex-col justify-between shadow-subtle hover:shadow-floating transition-all group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-sand-100 text-ink-700 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-moss-700" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900 group-hover:text-moss-700">
                  NGOs & Stray Rescue
                </h3>
                <p className="text-xs text-ink-500 leading-relaxed">
                  Animal birth control (ABC), treatment for injured community dogs, anti-rabies vaccination drives, and shelter adoptions.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-moss-700">
                <span>50+ non-profit shelters</span>
                <span>&rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Open Near You Now (4 cards) */}
      <section className="bg-sand-100/50 border-y border-sand-200 py-16 px-4 md:px-6">
        <div className="max-w-container mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
                Real-Time Availability
              </span>
              <h2 className="font-serif-h2">
                Open near you right now
              </h2>
              <p className="text-xs sm:text-sm text-ink-500">
                Facilities verified operational in {selectedCity} during this hour.
              </p>
            </div>
            <Link to="/search?openNow=1">
              <Button variant="outline" size="sm" className="border-ink-400">
                <span>View all open facilities</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openNearYou.map((prov) => (
              <ProviderCard key={prov.id} provider={prov} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Popular Services Chips (Explore Services CTA) */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-container mx-auto space-y-6">
          <div className="space-y-1">
            <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
              Common Treatments
            </span>
            <h2 className="font-serif-h2">
              Popular services & diagnostics
            </h2>
            <p className="text-xs sm:text-sm text-ink-500">
              Select any procedure to compare indicative pricing across verified centres.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {[
              'Vaccination (DHPPi / ARV)',
              'Tick Fever PCR Panel',
              'Digital Radiography (X-Ray)',
              'Abdominal Ultrasound',
              'Complete Blood Count (CBC)',
              'Dental Scaling & Polishing',
              'Canine Boarding (Cage-Free)',
              'Puppy Health Check-up',
              'Home Blood Sample Collection',
              'Orthopaedic Fracture Surgery',
              'Stray Animal First Aid',
              'Psittacine Avian Check',
            ].map((srv) => (
              <Link
                key={srv}
                to={`/search?service=${encodeURIComponent(srv.split(' ')[0])}`}
                className="px-4 py-2 rounded-pill bg-surface hover:bg-moss-50 text-xs font-medium text-ink-900 border border-sand-200 hover:border-moss-700 transition-colors shadow-subtle"
              >
                {srv}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. How We Verify — 3-Step Timeline Defining the 3 Badges */}
      <section id="how-we-verify" className="bg-surface border-y border-sand-200 py-16 px-4 md:px-6">
        <div className="max-w-container mx-auto space-y-8">
          <div className="space-y-1 text-center max-w-xl mx-auto">
            <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
              Trust Mechanics
            </span>
            <h2 className="font-serif-h2">
              How we verify listings
            </h2>
            <p className="text-xs sm:text-sm text-ink-500">
              In a directory, trust is the product. Every badge represents a clear verification audit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* Badge 1: Document-verified */}
            <div className="bg-sand-100/60 rounded-card border border-sand-200 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-moss-50 text-moss-800 border border-moss-700/30 px-3 py-1 rounded-pill text-xs font-bold inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-moss-700" />
                  Document-verified
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-900">
                Licence & Registration Audit
              </h3>
              <p className="text-xs text-ink-700 leading-relaxed">
                We verify government trade licences, State Veterinary Council registration certificates, and physical clinic signboard photos.
              </p>
              <div className="text-[11px] text-ink-500 font-mono pt-1">
                Badge colour: Moss Fill
              </div>
            </div>

            {/* Badge 2: Phone-verified */}
            <div className="bg-sand-100/60 rounded-card border border-sand-200 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-surface text-moss-800 border border-moss-700/40 px-3 py-1 rounded-pill text-xs font-bold inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-moss-700" />
                  Phone-verified
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-900">
                Direct Clinic Confirmation
              </h3>
              <p className="text-xs text-ink-700 leading-relaxed">
                Direct phone interview conducted with clinic staff or attending veterinarian confirming active operational hours and dispatch numbers.
              </p>
              <div className="text-[11px] text-ink-500 font-mono pt-1">
                Badge colour: Moss Outline
              </div>
            </div>

            {/* Badge 3: Community-added */}
            <div className="bg-sand-100/60 rounded-card border border-sand-200 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-sand-100 text-ink-700 border border-ink-400 px-3 py-1 rounded-pill text-xs font-bold inline-flex items-center gap-1.5">
                  Community-added
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-900">
                Crowdsourced by Pet Parents
              </h3>
              <p className="text-xs text-ink-700 leading-relaxed">
                Submitted by local animal feeders or visitors. Displays a "Help verify" prompt until our coordinators audit credentials.
              </p>
              <div className="text-[11px] text-ink-500 font-mono pt-1">
                Badge colour: Neutral Outline
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. "Found an Injured Animal?" Rescue Band */}
      <section className="bg-alert-100 border-b border-alert-700/20 py-10 px-4 md:px-6">
        <div className="max-w-container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <span className="overline text-xs font-bold text-alert-700 tracking-wider">
              Moment 3 &bull; Stray Rescue
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
              Found an injured stray dog, kitten, or bird?
            </h2>
            <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
              Find non-profit animal rescue helplines, street first-aid posts, and ambulance dispatchers ready to assist road hit and injured community animals.
            </p>
          </div>

          <Link to="/search?type=ngo&emergency=1">
            <Button
              variant="emergency"
              size="lg"
              className="bg-alert-700 text-white font-bold shrink-0 min-h-[48px] px-6"
            >
              <span>Find Rescue NGOs & Ambulances</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 9. Providers Supply Band */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-container mx-auto bg-surface rounded-hero border border-sand-200 p-8 md:p-12 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
              Moment 4 &bull; Supply
            </span>
            <h2 className="font-serif-h2">
              Run a clinic, boarding centre or rescue?
            </h2>
            <p className="text-sm text-ink-700 leading-relaxed">
              Get found by pet parents and caregivers in your neighborhood.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium text-ink-900 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-moss-700 shrink-0" />
                <span>100% Free to list</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-moss-700 shrink-0" />
                <span>Takes about 5 minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-moss-700 shrink-0" />
                <span>Claim existing listing</span>
              </div>
            </div>
          </div>

          <Link to="/list-your-business">
            <Button
              variant="primary"
              size="lg"
              className="bg-moss-700 text-white font-bold shrink-0 min-h-[52px] px-8 text-base shadow-subtle"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              <span>List Your Business</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
