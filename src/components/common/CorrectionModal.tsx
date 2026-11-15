import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Upload, AlertCircle, FileText, Check } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Button } from '../ui/Button';
import { track } from '../../utils/analytics';

const CORRECTION_REASONS = [
  { id: 'phone_number', label: 'Phone number' },
  { id: 'address_location', label: 'Address / location' },
  { id: 'hours', label: 'Hours & schedule' },
  { id: 'services_fees', label: 'Services or fees' },
  { id: 'permanently_closed', label: 'Permanently closed' },
  { id: 'duplicate', label: 'Duplicate listing' },
  { id: 'other', label: 'Other error' },
];

export const CorrectionModal: React.FC = () => {
  const { correctionTarget, closeCorrection } = useDemo();
  const [reason, setReason] = useState<string>('phone_number');
  const [details, setDetails] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>(''); // anti-bot honeypot
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCorrection();
    };
    if (correctionTarget) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [correctionTarget, closeCorrection]);

  if (!correctionTarget) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size <= 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File size exceeds 5 MB. Please upload a smaller image or PDF.');
      return;
    }

    // Check extension
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid format. Only JPEG, PNG, WEBP or PDF allowed.');
      return;
    }

    setUploadedFile({ name: file.name, size: file.size });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (details.trim().length < 10) {
      errs.details = 'Please provide at least 10 characters explaining the correction.';
    } else if (details.length > 500) {
      errs.details = 'Details cannot exceed 500 characters.';
    }

    if (!consent) {
      errs.consent = 'You must confirm that this correction is submitted in good faith.';
    }

    if (contact && !/^[0-9+() -]{8,15}$|^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())) {
      errs.contact = 'Please enter a valid phone number or email address.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot check
    if (honeypot) {
      console.warn('Bot submission trapped via honeypot');
      closeCorrection();
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Generate reference ID e.g. COR-2041
      const refId = `COR-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedRef(refId);
      setIsSubmitting(false);

      track('correction_submit', {
        providerId: correctionTarget.id,
        providerName: correctionTarget.name,
        reason,
        referenceId: refId,
        charCount: details.length,
        hasProof: !!uploadedFile,
      });
    }, 450);
  };

  const handleResetAndClose = () => {
    setSubmittedRef(null);
    setDetails('');
    setContact('');
    setConsent(false);
    setUploadedFile(null);
    setErrors({});
    closeCorrection();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-surface w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-sand-200 shadow-floating p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-sand-200 pb-4">
          <div>
            <span className="overline text-xs font-semibold text-moss-700 tracking-wider">
              Data Quality & Trust
            </span>
            <h2 id="correction-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-ink-900">
              Submit a Correction
            </h2>
            <p className="text-xs sm:text-sm text-ink-500 mt-0.5 line-clamp-1">
              For: <span className="font-semibold text-ink-700">{correctionTarget.name}</span>
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-ink-500 hover:text-ink-900 rounded-btn hover:bg-sand-100 focus-visible:ring-2 focus-visible:ring-moss-700"
            aria-label="Close correction dialog"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Success View */}
        {submittedRef ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-moss-50 border border-moss-600/30 text-moss-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" strokeWidth={2} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-ink-900">Thank you for keeping animals safe</h3>
              <p className="text-sm text-ink-700 max-w-md mx-auto">
                Your report has been logged under Reference ID:
              </p>
              <div className="inline-block bg-sand-100 text-ink-900 font-mono font-bold text-lg px-4 py-1.5 rounded-btn border border-sand-200 my-2">
                {submittedRef}
              </div>
            </div>
            <p className="text-xs text-ink-500">
              In a directory, trust is the product. We verify community corrections within <strong>2 working days</strong> before updating the listing.
            </p>
            <div className="pt-4">
              <Button variant="primary" onClick={handleResetAndClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Honeypot hidden input */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="company_website_hp">Leave this empty</label>
              <input
                id="company_website_hp"
                type="text"
                tabIndex={-1}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Reason Radios */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-ink-900">
                What needs to be corrected? <span className="text-alert-700">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {CORRECTION_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-btn border cursor-pointer text-sm transition-colors ${
                      reason === r.id
                        ? 'bg-moss-50 border-moss-700 text-moss-800 font-medium'
                        : 'bg-surface border-sand-200 text-ink-700 hover:bg-sand-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correction_reason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={() => setReason(r.id)}
                      className="accent-moss-700 w-4 h-4"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Details with Live Character Count */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="correction-details" className="font-semibold text-ink-900">
                  Correction Details <span className="text-alert-700">*</span>
                </label>
                <span
                  className={`text-xs tabular-nums ${
                    details.length > 500 ? 'text-alert-700 font-semibold' : 'text-ink-500'
                  }`}
                >
                  {details.length} / 500
                </span>
              </div>
              <textarea
                id="correction-details"
                rows={3}
                value={details}
                onChange={(e) => {
                  setDetails(e.target.value);
                  if (errors.details) {
                    setErrors((prev) => ({ ...prev, details: '' }));
                  }
                }}
                placeholder="E.g., The phone number has changed to +91 98450 XXXXX, or the OPD closes at 8 pm instead of 9 pm."
                className={`w-full p-3 rounded-btn border text-base text-ink-900 bg-surface focus:outline-none focus:ring-2 focus:ring-moss-700 ${
                  errors.details ? 'border-alert-700 bg-alert-100/20' : 'border-ink-400'
                }`}
                aria-describedby={errors.details ? 'details-error' : undefined}
                aria-invalid={!!errors.details}
              />
              {errors.details && (
                <p id="details-error" className="text-xs text-alert-700 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.details}
                </p>
              )}
            </div>

            {/* Optional Proof Mock Upload */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-ink-900">
                Supporting Photo or Document <span className="text-ink-500 font-normal">(Optional)</span>
              </label>
              {uploadedFile ? (
                <div className="flex items-center justify-between p-3 rounded-btn bg-sand-100 border border-sand-200">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-moss-700 shrink-0" />
                    <span className="text-xs font-medium text-ink-900 truncate">{uploadedFile.name}</span>
                    <span className="text-[11px] text-ink-500 shrink-0">
                      ({(uploadedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="text-xs text-alert-700 font-semibold hover:underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-sand-200 hover:border-moss-600 rounded-btn cursor-pointer bg-surface hover:bg-moss-50/40 transition-colors">
                  <Upload className="w-4 h-4 text-ink-500" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-ink-700">
                    Upload clinic board photo or prescription header (Image/PDF ≤ 5 MB)
                  </span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              )}
              {fileError && (
                <p className="text-xs text-alert-700 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fileError}
                </p>
              )}
            </div>

            {/* Optional Reporter Contact */}
            <div className="space-y-1.5">
              <label htmlFor="reporter-contact" className="block text-sm font-semibold text-ink-900">
                Your Phone or Email <span className="text-ink-500 font-normal">(Optional, in case we need to verify)</span>
              </label>
              <input
                id="reporter-contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98XXX XXXXX or email@example.com"
                className="w-full p-2.5 rounded-btn border border-ink-400 text-base text-ink-900 bg-surface focus:outline-none focus:ring-2 focus:ring-moss-700"
                aria-describedby={errors.contact ? 'contact-error' : undefined}
              />
              {errors.contact && (
                <p id="contact-error" className="text-xs text-alert-700 font-medium">
                  {errors.contact}
                </p>
              )}
            </div>

            {/* Good faith consent */}
            <div className="space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (errors.consent) {
                      setErrors((prev) => ({ ...prev, consent: '' }));
                    }
                  }}
                  className="mt-1 accent-moss-700 w-4 h-4 rounded"
                />
                <span className="text-xs text-ink-700 leading-snug">
                  I confirm this correction is accurate and submitted to help animals receive timely care.
                </span>
              </label>
              {errors.consent && (
                <p className="text-xs text-alert-700 font-medium pl-6.5">
                  {errors.consent}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
              <Button variant="ghost" onClick={handleResetAndClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                className="min-w-[130px]"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Correction'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
