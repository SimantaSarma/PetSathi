import React from 'react';
import { Dog, Cat, Bird, PawPrint } from 'lucide-react';
import { AnimalSpecies } from '../../types';

interface SpeciesPictogramProps {
  species: AnimalSpecies;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  showLabel?: boolean;
  onClick?: () => void;
}

export const SPECIES_LABELS: Record<AnimalSpecies, string> = {
  dog: 'Dogs',
  cat: 'Cats',
  bird: 'Birds',
  rabbit: 'Rabbits',
  livestock: 'Livestock & Cattle',
  exotic: 'Exotic Pets',
};

// Custom SVG icon for Rabbit if needed, or clean SVG
const RabbitIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M13 16a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3c1.66 0 3 1.34 3 3z" />
    <path d="M18 13a4 4 0 0 1-4 4h-2" />
    <path d="M10 10c0-3-1.5-6-3-6s-3 3-3 6" />
    <path d="M14 10c0-3 1.5-6 3-6s3 3 3 6" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
  </svg>
);

// Custom SVG icon for Livestock (Bovine / Cow silhouette)
const LivestockIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 8l3-3 3 2h4l3-2 3 3" />
    <path d="M6 10v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-6" />
    <circle cx="9" cy="13" r="1" fill="currentColor" />
    <circle cx="15" cy="13" r="1" fill="currentColor" />
    <path d="M10 17h4" />
  </svg>
);

export const SpeciesPictogram: React.FC<SpeciesPictogramProps> = ({
  species,
  size = 'md',
  active = false,
  showLabel = false,
  onClick,
}) => {
  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const containerSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const renderIcon = () => {
    switch (species) {
      case 'dog':
        return <Dog className={iconSizeClasses[size]} strokeWidth={1.5} />;
      case 'cat':
        return <Cat className={iconSizeClasses[size]} strokeWidth={1.5} />;
      case 'bird':
        return <Bird className={iconSizeClasses[size]} strokeWidth={1.5} />;
      case 'rabbit':
        return <RabbitIcon className={iconSizeClasses[size]} />;
      case 'livestock':
        return <LivestockIcon className={iconSizeClasses[size]} />;
      case 'exotic':
      default:
        return <PawPrint className={iconSizeClasses[size]} strokeWidth={1.5} />;
    }
  };

  const content = (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`inline-flex items-center justify-center rounded-full transition-colors ${
          containerSizeClasses[size]
        } ${
          active
            ? 'bg-moss-700 text-white'
            : 'bg-moss-50 text-moss-800 border border-moss-600/20 hover:bg-moss-100'
        }`}
        title={SPECIES_LABELS[species]}
      >
        {renderIcon()}
      </div>
      {showLabel && (
        <span
          className={`text-sm ${
            active ? 'font-semibold text-moss-800' : 'text-ink-700 font-medium'
          }`}
        >
          {SPECIES_LABELS[species]}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-700 rounded-full"
      >
        {content}
      </button>
    );
  }

  return content;
};
