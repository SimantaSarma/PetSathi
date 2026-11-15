import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Search, Home, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-6">
      <div className="w-16 h-16 rounded-full bg-sand-100 border border-sand-200 flex items-center justify-center text-moss-700">
        <HelpCircle className="w-8 h-8" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <span className="overline text-xs font-semibold text-moss-700">404 Error</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900">
          Page Not Found
        </h1>
        <p className="text-sm text-ink-700 leading-relaxed">
          The animal care page you requested may have moved or been updated. You can search verified clinics and hospitals or access 24×7 emergency care below.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link to="/search">
          <Button variant="primary" size="md">
            <Search className="w-4 h-4 mr-2" />
            <span>Search Directory</span>
          </Button>
        </Link>
        <Link to="/emergency">
          <Button variant="emergency" size="md">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Emergency Care</span>
          </Button>
        </Link>
        <Link to="/">
          <Button variant="ghost" size="md">
            <Home className="w-4 h-4 mr-1.5" />
            <span>Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
