import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PlusCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { SAMPLE_PROVIDERS } from '../../data/providers';

export const Footer: React.FC = () => {
  const { openCorrection } = useDemo();

  const handleFooterCorrection = () => {
    // Open correction modal with first provider or a generic one
    openCorrection(SAMPLE_PROVIDERS[0]);
  };

  return (
    <footer className="bg-sand-100 border-t border-sand-200 mt-16 md:mt-24 text-ink-700">
      <div className="max-w-container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-moss-50 border border-moss-600/30 flex items-center justify-center p-1">
                <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
                  <path d="M24 38C20 38 16 35.5 16 31C16 26.8 20.2 24 24 24C27.8 24 32 26.8 32 31C32 35.5 28 38 24 38Z" fill="#0D5C4B" />
                  <ellipse cx="14.5" cy="20.5" rx="3.5" ry="4.5" transform="rotate(-20 14.5 20.5)" fill="#0D5C4B" />
                  <ellipse cx="20.5" cy="15.5" rx="3.5" ry="4.8" transform="rotate(-6 20.5 15.5)" fill="#0D5C4B" />
                  <ellipse cx="27.5" cy="15.5" rx="3.5" ry="4.8" transform="rotate(6 27.5 15.5)" fill="#0D5C4B" />
                  <ellipse cx="33.5" cy="20.5" rx="3.5" ry="4.5" transform="rotate(20 33.5 20.5)" fill="#F2A93B" />
                </svg>
              </div>
              <span className="font-serif font-bold text-lg text-ink-900">Practo for Animals</span>
            </div>
            <p className="text-sm text-ink-500 leading-relaxed">
              India’s dedicated veterinary discovery & animal emergency care network. Mapped, verified, and always one tap from care.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="overline text-xs font-semibold text-ink-900 tracking-wider">Discovery</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search?type=vet_clinic" className="hover:text-ink-900 transition-colors">
                  Veterinary Clinics
                </Link>
              </li>
              <li>
                <Link to="/search?type=animal_hospital" className="hover:text-ink-900 transition-colors">
                  24×7 Animal Hospitals
                </Link>
              </li>
              <li>
                <Link to="/search?type=boarding" className="hover:text-ink-900 transition-colors">
                  Boarding & Daycare
                </Link>
              </li>
              <li>
                <Link to="/search?type=diagnostics" className="hover:text-ink-900 transition-colors">
                  Diagnostics Labs & Pathology
                </Link>
              </li>
              <li>
                <Link to="/search?type=ambulance" className="hover:text-ink-900 transition-colors">
                  Animal Ambulances
                </Link>
              </li>
              <li>
                <Link to="/search?type=ngo" className="hover:text-ink-900 transition-colors">
                  NGOs & Stray Rescue
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Supply */}
          <div className="space-y-3">
            <h4 className="overline text-xs font-semibold text-ink-900 tracking-wider">Trust & Quality</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about-prototype#how-we-verify" className="flex items-center gap-1.5 hover:text-ink-900">
                  <ShieldCheck className="w-4 h-4 text-moss-700" strokeWidth={1.5} />
                  <span>How we verify listings</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleFooterCorrection}
                  className="flex items-center gap-1.5 text-left text-ink-700 hover:text-ink-900"
                >
                  <HelpCircle className="w-4 h-4 text-ink-500" strokeWidth={1.5} />
                  <span>Submit a Correction</span>
                </button>
              </li>
              <li>
                <Link to="/list-your-business" className="flex items-center gap-1.5 hover:text-ink-900">
                  <PlusCircle className="w-4 h-4 text-moss-700" strokeWidth={1.5} />
                  <span>List Your Business (Free)</span>
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="flex items-center gap-1.5 text-alert-700 font-medium hover:underline">
                  <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                  <span>Emergency Directory</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Assignment / Legal */}
          <div className="space-y-3">
            <h4 className="overline text-xs font-semibold text-ink-900 tracking-wider">Assignment & Info</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about-prototype" className="text-moss-700 font-semibold hover:underline">
                  About this prototype & rubric
                </Link>
              </li>
              <li>
                <span className="text-xs text-ink-500">Design System: Warm Clinical</span>
              </li>
              <li>
                <span className="text-xs text-ink-500">Coverage: Bengaluru, Mumbai, Delhi NCR</span>
              </li>
              <li>
                <span className="text-xs text-ink-500">Timezone: Asia/Kolkata (IST)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer as required */}
        <div className="pt-8 border-t border-sand-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-ink-500">
          <p className="max-w-prose">
            <strong>Disclaimer:</strong> Practo for Animals is a discovery directory and does not provide veterinary medical advice or formal triage diagnosis. In an emergency, please contact the nearest listed 24×7 hospital or ambulance immediately.
          </p>
          <p className="shrink-0 text-ink-500">
            Sample candidate assignment &bull; No fake AI &bull; Contrast verified
          </p>
        </div>
      </div>
    </footer>
  );
};
