import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Copy,
  Building,
  Clock,
  Phone,
  ShieldCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SAMPLE_PROVIDERS } from '../data/providers';
import { ProviderType, AnimalSpecies } from '../types';
import { SPECIES_LABELS } from '../components/ui/SpeciesPictogram';
import { track } from '../utils/analytics';
import { useDemo } from '../context/DemoContext';

const DRAFT_KEY = 'practo_animals_business_draft_v1';

const INITIAL_FORM_STATE = {
  // Step 1: Basics
  name: '',
  types: ['vet_clinic'] as ProviderType[],
  addressLine: '',
  area: '',
  city: 'Bengaluru',
  pincode: '',
  landmark: '',
  // Step 2: Services & Animals
  animals: ['dog', 'cat'] as AnimalSpecies[],
  servicesList: ['General Consultation', 'Vaccination'],
  minFee: '500',
  // Step 3: Hours & Contact
  phone: '',
  whatsapp: '',
  whatsappSameAsPhone: true,
  is24x7: false,
  openTime: '09:00',
  closeTime: '20:00',
  hasSeparateEmergency: false,
  emergencyHoursNotes: '',
  // Step 4: Verification & Ownership
  ownerName: '',
  ownerRole: 'Chief Veterinarian / Medical Director',
  regNumber: '',
  uploadedDocName: '',
  consent: false,
};

export const ListBusinessPage: React.FC = () => {
  const { showToast } = useDemo();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [hasDraft, setHasDraft] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ name: string; slug: string } | null>(
    null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionRef, setSubmissionRef] = useState('');

  // Check and load draft on mount
  useEffect(() => {
    track('list_business_start', { step: 1 });
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.phone) {
          setHasDraft(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Autosave draft to localStorage
  useEffect(() => {
    if (!isSubmitted && formData.name) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch {
        // quota
      }
    }
  }, [formData, isSubmitted]);

  const resumeDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        setFormData(JSON.parse(saved));
        setHasDraft(false);
        showToast('Draft restored from local cache', 'success');
      }
    } catch {
      // ignore
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  // Duplicate check: name + pincode matching existing sample providers
  useEffect(() => {
    if (formData.name.trim().length >= 3 && formData.pincode.length === 6) {
      const match = SAMPLE_PROVIDERS.find(
        (p) =>
          p.address.pincode === formData.pincode.trim() ||
          p.name.toLowerCase().includes(formData.name.toLowerCase().trim())
      );
      if (match) {
        setDuplicateWarning({ name: match.name, slug: match.slug });
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.name, formData.pincode]);

  const validateStep = (step: number) => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (formData.name.trim().length < 3 || formData.name.trim().length > 80) {
        errs.name = 'Business name must be between 3 and 80 characters.';
      }
      if (formData.types.length === 0) {
        errs.types = 'Please select at least one business category.';
      }
      if (!formData.addressLine.trim()) {
        errs.addressLine = 'Street address line is required.';
      }
      if (!formData.area.trim()) {
        errs.area = 'Locality or neighborhood is required.';
      }
      if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
        errs.pincode = 'Please enter a valid 6-digit Indian pincode.';
      }
    } else if (step === 2) {
      if (formData.animals.length === 0) {
        errs.animals = 'Please choose at least one animal species you treat or care for.';
      }
      if (formData.servicesList.length === 0) {
        errs.services = 'Please list at least one service offered.';
      }
    } else if (step === 3) {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      const standard10 = cleanPhone.length === 12 && cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone;
      if (!/^[6-9]\d{9}$/.test(standard10)) {
        errs.phone = 'Enter a valid 10-digit Indian mobile number starting with 6–9.';
      }
    } else if (step === 4) {
      if (!formData.ownerName.trim()) {
        errs.ownerName = 'Please enter the primary contact or owner name.';
      }
      if (!formData.consent) {
        errs.consent = 'You must confirm that you represent this animal care facility.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ref = `VET-REG-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmissionRef(ref);
      setIsSubmitting(false);
      setIsSubmitted(true);
      localStorage.removeItem(DRAFT_KEY);

      track('list_business_submit', {
        name: formData.name,
        pincode: formData.pincode,
        referenceId: ref,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-paper pb-24">
      
      {/* Header */}
      <header className="bg-surface border-b border-sand-200 py-8 px-4 sm:px-6">
        <div className="max-w-container mx-auto">
          <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
            Supply & Partner Network
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 mt-1">
            List Your Animal Care Facility
          </h1>
          <p className="text-sm sm:text-base text-ink-500 max-w-2xl mt-1">
            Free forever to list. Reach pet parents and animal caregivers nearby in 4 simple steps.
          </p>

          {/* Resume Draft Banner */}
          {hasDraft && (
            <div className="mt-4 p-3.5 bg-moss-50 border border-moss-700/30 rounded-btn flex items-center justify-between gap-4 text-xs">
              <span className="text-moss-800 font-medium">
                You have an unsaved listing draft from a previous session.
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={resumeDraft}
                  className="bg-moss-700 text-white font-semibold px-3 py-1.5 rounded-btn hover:bg-moss-800"
                >
                  Resume Draft
                </button>
                <button
                  type="button"
                  onClick={discardDraft}
                  className="text-ink-500 hover:text-ink-900"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Stepper Navigation */}
      {!isSubmitted && (
        <nav aria-label="Registration steps" className="bg-sand-100/70 border-b border-sand-200 py-3 px-4 sm:px-6">
          <div className="max-w-container mx-auto flex items-center justify-between text-xs font-semibold text-ink-700">
            {[
              { num: 1, label: '1. Basics' },
              { num: 2, label: '2. Services & Animals' },
              { num: 3, label: '3. Hours & Contact' },
              { num: 4, label: '4. Review & Verify' },
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (step.num < currentStep) setCurrentStep(step.num);
                }}
                className={`flex items-center gap-1.5 py-1 px-2 rounded-btn transition-colors ${
                  currentStep === step.num
                    ? 'text-moss-800 bg-surface shadow-subtle border border-moss-700/30 font-bold'
                    : currentStep > step.num
                    ? 'text-moss-700 hover:underline'
                    : 'text-ink-500 cursor-not-allowed'
                }`}
              >
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Main Form Body */}
      <main className="max-w-container mx-auto px-4 sm:px-6 pt-8">
        {isSubmitted ? (
          /* Success Screen */
          <div className="bg-surface rounded-card border border-sand-200 p-8 max-w-xl mx-auto shadow-floating text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 bg-moss-50 border border-moss-600/30 text-moss-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="overline text-xs font-semibold text-moss-700">
                Application Received
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
                Welcome to Practo for Animals
              </h2>
              <p className="text-sm text-ink-700">
                Your listing submission for <strong>{formData.name}</strong> has been created with registration reference:
              </p>
              <div className="inline-block bg-sand-100 text-ink-900 font-mono font-bold text-lg px-4 py-2 rounded-btn border border-sand-200 my-2">
                {submissionRef}
              </div>
            </div>

            {/* What Happens Next Card as required */}
            <div className="bg-sand-100 p-5 rounded-btn border border-sand-200 text-left space-y-3 text-xs text-ink-700">
              <h4 className="font-bold text-ink-900 text-sm">What happens next:</h4>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Phone Verification:</strong> Our veterinary verification coordinator will call you within <strong>2 working days</strong> to confirm operating hours.
                </li>
                <li>
                  <strong>Documents that speed up verification:</strong> State Veterinary Council Registration, Clinical Establishment Act Certificate, or Municipality Trade Licence.
                </li>
                <li>
                  <strong>Document-verified Badge:</strong> Once confirmed, your listing receives the verified badge and goes live on search.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-center gap-4">
              <Link to="/search">
                <Button variant="primary">Explore Directory</Button>
              </Link>
            </div>
          </div>
        ) : (
          /* 4-Step Form Container */
          <div className="bg-surface rounded-card border border-sand-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-subtle space-y-6">
            
            {/* Duplicate Check Warning */}
            {duplicateWarning && (
              <div className="p-4 bg-amber-100 border border-amber-800/30 rounded-btn flex items-start gap-3 text-xs text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-800 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">This facility looks already listed!</p>
                  <p>
                    "{duplicateWarning.name}" is already in our directory at this location.
                  </p>
                  <Link
                    to={`/provider/${duplicateWarning.slug}`}
                    className="font-semibold underline inline-block pt-1"
                  >
                    View existing listing & claim ownership instead &rarr;
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: BASICS */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h3 className="font-serif text-xl font-bold text-ink-900 border-b border-sand-200 pb-3">
                    Basic Facility Details
                  </h3>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-ink-900">
                      Facility Name <span className="text-alert-700">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="E.g., Pet Life Specialty Veterinary Hospital"
                      className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-moss-700"
                    />
                    {errors.name && <p className="text-xs text-alert-700 font-medium">{errors.name}</p>}
                  </div>

                  {/* Types Multi-Select */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-ink-900">
                      Category Type(s) <span className="text-alert-700">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'vet_clinic', label: 'Veterinary Clinic' },
                        { id: 'animal_hospital', label: 'Animal Hospital (24×7)' },
                        { id: 'boarding', label: 'Boarding & Daycare' },
                        { id: 'diagnostics', label: 'Diagnostics & Pathology' },
                        { id: 'ambulance', label: 'Animal Ambulance' },
                        { id: 'ngo', label: 'NGO / Stray Rescue Shelter' },
                      ].map((t) => {
                        const checked = formData.types.includes(t.id as ProviderType);
                        return (
                          <label
                            key={t.id}
                            className={`flex items-center gap-2 p-2.5 rounded-btn border cursor-pointer ${
                              checked
                                ? 'bg-moss-50 border-moss-700 text-moss-800 font-semibold'
                                : 'border-sand-200 hover:bg-sand-100 text-ink-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const next = checked
                                  ? formData.types.filter((item) => item !== t.id)
                                  : [...formData.types, t.id as ProviderType];
                                setFormData({ ...formData, types: next });
                              }}
                              className="accent-moss-700 w-4 h-4 rounded"
                            />
                            <span>{t.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.types && <p className="text-xs text-alert-700 font-medium">{errors.types}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-ink-900">
                        Street Address <span className="text-alert-700">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine}
                        onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                        placeholder="Plot / Door No, Street, Building"
                        className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-moss-700"
                      />
                      {errors.addressLine && (
                        <p className="text-xs text-alert-700 font-medium">{errors.addressLine}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-ink-900">
                          Area / Locality <span className="text-alert-700">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          placeholder="E.g., Koramangala"
                          className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-moss-700"
                        />
                        {errors.area && <p className="text-xs text-alert-700 font-medium">{errors.area}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-ink-900">City</label>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 bg-surface focus:outline-none focus:ring-2 focus:ring-moss-700"
                        >
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Delhi NCR">Delhi NCR</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-ink-900">
                          Pincode <span className="text-alert-700">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="6-digit code"
                          className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 font-mono focus:outline-none focus:ring-2 focus:ring-moss-700"
                        />
                        {errors.pincode && (
                          <p className="text-xs text-alert-700 font-medium">{errors.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SERVICES & ANIMALS */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h3 className="font-serif text-xl font-bold text-ink-900 border-b border-sand-200 pb-3">
                    Species Treated & Services
                  </h3>

                  {/* Animals Chips */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-ink-900">
                      Species Treated <span className="text-alert-700">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(['dog', 'cat', 'bird', 'rabbit', 'livestock', 'exotic'] as AnimalSpecies[]).map(
                        (sp) => {
                          const active = formData.animals.includes(sp);
                          return (
                            <button
                              key={sp}
                              type="button"
                              onClick={() => {
                                const next = active
                                  ? formData.animals.filter((a) => a !== sp)
                                  : [...formData.animals, sp];
                                setFormData({ ...formData, animals: next });
                              }}
                              className={`p-2.5 rounded-btn border text-xs font-semibold flex items-center gap-2 transition-colors ${
                                active
                                  ? 'bg-moss-50 border-moss-700 text-moss-800'
                                  : 'border-sand-200 text-ink-700 hover:bg-sand-100'
                              }`}
                            >
                              <span className="capitalize">{SPECIES_LABELS[sp]}</span>
                            </button>
                          );
                        }
                      )}
                    </div>
                    {errors.animals && (
                      <p className="text-xs text-alert-700 font-medium">{errors.animals}</p>
                    )}
                  </div>

                  {/* Services Chips */}
                  <div className="space-y-2 pt-3 border-t border-sand-200">
                    <label className="block text-sm font-semibold text-ink-900">
                      Key Services Offered <span className="text-alert-700">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        'General Consultation',
                        'Vaccination',
                        'Deworming',
                        'Digital X-Ray',
                        'Ultrasound',
                        'Soft Tissue Surgery',
                        'Dental Scaling',
                        'In-House Blood Tests',
                        'Grooming',
                        'Emergency Triage',
                      ].map((srv) => {
                        const active = formData.servicesList.includes(srv);
                        return (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => {
                              const next = active
                                ? formData.servicesList.filter((s) => s !== srv)
                                : [...formData.servicesList, srv];
                              setFormData({ ...formData, servicesList: next });
                            }}
                            className={`px-3 py-1.5 rounded-pill border font-medium transition-colors ${
                              active
                                ? 'bg-moss-700 text-white border-moss-700'
                                : 'bg-sand-100 border-sand-200 text-ink-700 hover:bg-sand-200'
                            }`}
                          >
                            {srv}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Consultation Starting Fee */}
                  <div className="space-y-1 pt-3 border-t border-sand-200">
                    <label className="block text-sm font-semibold text-ink-900">
                      Starting Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.minFee}
                      onChange={(e) => setFormData({ ...formData, minFee: e.target.value })}
                      placeholder="500"
                      className="w-full sm:w-48 p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-moss-700"
                    />
                    <p className="text-xs text-ink-500">Helps pet parents filter transparently.</p>
                  </div>
                </div>
              )}

              {/* STEP 3: HOURS & CONTACT */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <h3 className="font-serif text-xl font-bold text-ink-900 border-b border-sand-200 pb-3">
                    Operating Hours & Verified Contact
                  </h3>

                  {/* Phone number */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-ink-900">
                      Primary Phone Number <span className="text-alert-700">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="p-2.5 bg-sand-100 rounded-btn border border-sand-200 text-sm font-semibold text-ink-700">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="98450 12345"
                        className="flex-1 p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 font-mono focus:outline-none focus:ring-2 focus:ring-moss-700"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-alert-700 font-medium">{errors.phone}</p>}
                  </div>

                  {/* WhatsApp same-as-phone toggle */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink-900">
                      <input
                        type="checkbox"
                        checked={formData.whatsappSameAsPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsappSameAsPhone: e.target.checked })
                        }
                        className="accent-moss-700 w-4 h-4 rounded"
                      />
                      <span>WhatsApp number is same as primary phone</span>
                    </label>

                    {!formData.whatsappSameAsPhone && (
                      <div className="flex gap-2 pt-1">
                        <span className="p-2.5 bg-sand-100 rounded-btn border border-sand-200 text-sm font-semibold text-ink-700">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="Enter dedicated WhatsApp number"
                          className="flex-1 p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 font-mono focus:outline-none focus:ring-2 focus:ring-moss-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Hours Editor */}
                  <div className="space-y-3 pt-3 border-t border-sand-200">
                    <label className="block text-sm font-semibold text-ink-900">
                      Operating Schedule
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-alert-700">
                      <input
                        type="checkbox"
                        checked={formData.is24x7}
                        onChange={(e) => setFormData({ ...formData, is24x7: e.target.checked })}
                        className="accent-alert-700 w-4 h-4 rounded"
                      />
                      <span>Open 24×7 for continuous trauma & emergency care</span>
                    </label>

                    {!formData.is24x7 && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-xs text-ink-500">Opens At</label>
                          <input
                            type="time"
                            value={formData.openTime}
                            onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                            className="w-full p-2 rounded-btn border border-ink-400 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-ink-500">Closes At</label>
                          <input
                            type="time"
                            value={formData.closeTime}
                            onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                            className="w-full p-2 rounded-btn border border-ink-400 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & VERIFY */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <h3 className="font-serif text-xl font-bold text-ink-900 border-b border-sand-200 pb-3">
                    Verification & Ownership
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-ink-900">
                        Owner / In-Charge Name <span className="text-alert-700">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="Dr. Rajesh Kumar"
                        className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-moss-700"
                      />
                      {errors.ownerName && (
                        <p className="text-xs text-alert-700 font-medium">{errors.ownerName}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-ink-900">Role</label>
                      <input
                        type="text"
                        value={formData.ownerRole}
                        onChange={(e) => setFormData({ ...formData, ownerRole: e.target.value })}
                        placeholder="Owner / Partner / Veterinarian"
                        className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-moss-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-ink-900">
                      Veterinary Council Registration / Licence Number{' '}
                      <span className="text-ink-500 font-normal">(Optional, speeds up verification)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.regNumber}
                      onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                      placeholder="E.g. KVC-2015-8842 or VCI-9941"
                      className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 font-mono focus:outline-none focus:ring-2 focus:ring-moss-700"
                    />
                  </div>

                  {/* Mock Document Upload */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-sm font-semibold text-ink-900">
                      Upload Clinic Signboard or Registration Certificate{' '}
                      <span className="text-ink-500 font-normal">(Optional)</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-sand-200 hover:border-moss-700 rounded-btn cursor-pointer bg-surface hover:bg-moss-50/50">
                      <Upload className="w-4 h-4 text-ink-500" />
                      <span className="text-xs font-medium text-ink-700">
                        {formData.uploadedDocName || 'Upload PDF/JPEG document (≤ 5 MB)'}
                      </span>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({ ...formData, uploadedDocName: file.name });
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="space-y-1 pt-3 border-t border-sand-200">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="mt-1 accent-moss-700 w-4 h-4 rounded"
                      />
                      <span className="text-xs text-ink-700 leading-snug">
                        I confirm that I am authorized to register this animal healthcare or welfare facility and that the details provided are accurate.
                      </span>
                    </label>
                    {errors.consent && (
                      <p className="text-xs text-alert-700 font-medium">{errors.consent}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-sand-200 flex items-center justify-between">
                {currentStep > 1 ? (
                  <Button variant="secondary" size="md" onClick={handleBack} type="button">
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    <span>Back</span>
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button variant="primary" size="md" onClick={handleNext} type="button">
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                    className="font-bold min-w-[160px]"
                  >
                    {isSubmitting ? 'Submitting Application…' : 'Submit Listing (Free)'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
