import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Menu, X, PlusCircle, MapPin, Clock, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { track } from '../../utils/analytics';
import { useDemo } from '../../context/DemoContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { selectedCity, setSelectedCity, clockOverride, setClockOverride } = useDemo();

  const handleEmergencyClick = () => {
    track('emergency_open', { source: 'header_button', currentRoute: location.pathname });
    setMobileMenuOpen(false);
  };

  const handleListBusinessClick = () => {
    track('list_business_start', { source: 'header_nav' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Banner if demo clock override is active */}
      {clockOverride && (
        <aside
          aria-label="Simulation notice"
          className="bg-amber-100 text-amber-800 text-xs px-4 py-1.5 font-medium border-b border-amber-800/20 flex items-center justify-between"
        >
          <div className="max-w-container mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              <span>Simulated Clock active: <strong>{clockOverride} IST</strong> (Asia/Kolkata). Showing real-time open status for this hour.</span>
            </span>
            <button
              onClick={() => setClockOverride(null)}
              className="text-xs font-semibold underline hover:no-underline ml-2"
            >
              Reset to live time
            </button>
          </div>
        </aside>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-sand-200">
        <div className="max-w-container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Wordmark + Original Paw Mark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-700 rounded-lg p-1 -ml-1 group"
            onClick={() => track('search_submit', { action: 'logo_click' })}
          >
            <div className="w-9 h-9 rounded-xl bg-moss-50 border border-moss-600/30 flex items-center justify-center p-1.5 shadow-subtle group-hover:bg-moss-100 transition-colors">
              <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
                <path d="M24 38C20 38 16 35.5 16 31C16 26.8 20.2 24 24 24C27.8 24 32 26.8 32 31C32 35.5 28 38 24 38Z" fill="#0D5C4B" />
                <path d="M24 28V34M21 31H27" stroke="#FAF7F2" strokeWidth="2.5" strokeLinecap="round" />
                <ellipse cx="14.5" cy="20.5" rx="3.5" ry="4.5" transform="rotate(-20 14.5 20.5)" fill="#0D5C4B" />
                <ellipse cx="20.5" cy="15.5" rx="3.5" ry="4.8" transform="rotate(-6 20.5 15.5)" fill="#0D5C4B" />
                <ellipse cx="27.5" cy="15.5" rx="3.5" ry="4.8" transform="rotate(6 27.5 15.5)" fill="#0D5C4B" />
                <ellipse cx="33.5" cy="20.5" rx="3.5" ry="4.5" transform="rotate(20 33.5 20.5)" fill="#F2A93B" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg md:text-xl font-bold tracking-tight text-ink-900 leading-none">
                Practo for Animals
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-moss-700 leading-tight">
                Animal Care Mapped
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/search"
              className={`px-3 py-2 text-sm font-medium rounded-btn transition-colors ${
                location.pathname === '/search'
                  ? 'text-moss-800 bg-moss-50 font-semibold'
                  : 'text-ink-700 hover:text-ink-900 hover:bg-sand-100'
              }`}
            >
              Find a Vet
            </Link>
            <Link
              to="/search?service=Vaccination"
              className="px-3 py-2 text-sm font-medium text-ink-700 hover:text-ink-900 hover:bg-sand-100 rounded-btn transition-colors"
            >
              Services
            </Link>
            <Link
              to="/list-your-business"
              className={`px-3 py-2 text-sm font-medium rounded-btn transition-colors ${
                location.pathname === '/list-your-business'
                  ? 'text-moss-800 bg-moss-50 font-semibold'
                  : 'text-ink-700 hover:text-ink-900 hover:bg-sand-100'
              }`}
            >
              For Providers
            </Link>
            <Link
              to="/about-prototype"
              className={`px-3 py-2 text-sm font-medium rounded-btn transition-colors ${
                location.pathname === '/about-prototype'
                  ? 'text-moss-800 bg-moss-50 font-semibold'
                  : 'text-ink-700 hover:text-ink-900 hover:bg-sand-100'
              }`}
            >
              About Prototype
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* City Selector Pill */}
            <div className="hidden lg:flex items-center text-xs font-medium text-ink-700 bg-sand-100 border border-sand-200 rounded-pill px-2.5 py-1">
              <MapPin className="w-3.5 h-3.5 text-moss-700 mr-1" strokeWidth={1.5} />
              <select
                aria-label="Select City"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  track('filter_change', { filter: 'city', value: e.target.value });
                }}
                className="bg-transparent text-xs font-semibold text-ink-900 focus:outline-none cursor-pointer"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
              </select>
            </div>

            {/* List Your Business — Supply CTA (outline on desktop) */}
            <Link
              to="/list-your-business"
              onClick={handleListBusinessClick}
              className="hidden sm:inline-flex"
            >
              <Button variant="outline" size="sm" className="border-ink-400 text-ink-900">
                <PlusCircle className="w-4 h-4 mr-1.5 text-moss-700" strokeWidth={1.5} />
                <span>List Your Business</span>
              </Button>
            </Link>

            {/* Emergency CTA — Red alert button on EVERY route as permitted exception */}
            <Link to="/emergency" onClick={handleEmergencyClick}>
              <Button
                variant="emergency"
                size="sm"
                className="bg-alert-700 hover:bg-[#9E211A] text-white font-semibold flex items-center shadow-subtle min-h-[38px] px-3.5"
              >
                <AlertCircle className="w-4 h-4 mr-1.5 animate-pulse" strokeWidth={1.5} />
                <span>Emergency</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-btn text-ink-700 hover:text-ink-900 hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-700"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={1.5} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sheet */}
        {mobileMenuOpen && (
          <div
            className="md:hidden bg-surface border-b border-sand-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* City Picker inside Mobile Drawer */}
            <div className="flex items-center justify-between py-2 border-b border-sand-200">
              <span className="text-sm text-ink-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-moss-700" strokeWidth={1.5} />
                Current City:
              </span>
              <select
                aria-label="Select City"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  track('filter_change', { filter: 'city', value: e.target.value });
                }}
                className="bg-sand-100 text-sm font-semibold text-ink-900 px-3 py-1.5 rounded-btn border border-sand-200"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
              </select>
            </div>

            <div className="space-y-1">
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-medium text-ink-900 rounded-btn hover:bg-sand-100"
              >
                Find a Vet
              </Link>
              <Link
                to="/search?service=Vaccination"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-medium text-ink-900 rounded-btn hover:bg-sand-100"
              >
                Explore Popular Services
              </Link>
              <Link
                to="/emergency"
                onClick={() => {
                  track('emergency_open', { source: 'mobile_menu' });
                  setMobileMenuOpen(false);
                }}
                className="block px-3 py-2.5 text-base font-semibold text-alert-700 rounded-btn hover:bg-alert-100"
              >
                24×7 Emergency Care
              </Link>
              <Link
                to="/list-your-business"
                onClick={handleListBusinessClick}
                className="block px-3 py-2.5 text-base font-medium text-ink-900 rounded-btn hover:bg-sand-100"
              >
                List Your Business (Free)
              </Link>
              <Link
                to="/about-prototype"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-medium text-moss-700 rounded-btn hover:bg-moss-50"
              >
                About This Prototype
              </Link>
            </div>

            <div className="pt-2">
              <Link to="/list-your-business" onClick={handleListBusinessClick}>
                <Button variant="outline" fullWidth size="md" className="border-ink-400">
                  <PlusCircle className="w-4 h-4 mr-2 text-moss-700" strokeWidth={1.5} />
                  <span>List Your Business</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
