export type ProviderType = 
  | 'vet_clinic'
  | 'animal_hospital'
  | 'boarding'
  | 'diagnostics'
  | 'ambulance'
  | 'ngo';

export type VerificationType = 'document' | 'phone' | 'community';

export type ProviderStatus = 'open' | 'temporarily_closed' | 'permanently_closed';

export type AnimalSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'livestock' | 'exotic';

export interface ProviderAddress {
  line: string;
  area: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  landmark?: string;
  parkingAvailable?: boolean;
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string; // "09:00"
  closeTime: string; // "21:00"
  isOvernight?: boolean;
}

export interface ProviderHours {
  opd?: string[];
  emergency?: string[] | '24x7';
  exceptions?: string[];
  is24x7?: boolean;
  notes?: string;
  // structured schedules for computational open now
  structuredOpd?: DaySchedule[];
  structuredEmergency?: DaySchedule[];
}

export interface ProviderService {
  name: string;
  fromPrice?: number;
  description?: string;
}

export interface TypeSpecificMetadata {
  // Ambulance
  coverageKm?: number;
  hasOxygen?: boolean;
  dispatcherPhone?: string;
  // NGO & Rescue
  causes?: string[];
  acceptsDonations?: boolean;
  acceptsAdoption?: boolean;
  donationAccount?: string;
  // Boarding & Daycare
  capacity?: number;
  nightlyRate?: number;
  hasCctv?: boolean;
  cageFree?: boolean;
  vaccinationRequired?: boolean;
  // Diagnostics & Labs
  testsCount?: number;
  turnaroundHours?: number;
  homeSampleCollection?: boolean;
  // Mobile / Large animal
  mobileUnit?: boolean;
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  types: ProviderType[];
  verification: VerificationType;
  lastVerifiedAt: string; // e.g. "12 Oct 2026"
  address: ProviderAddress;
  phone?: string;
  whatsapp?: string;
  website?: string;
  hours?: ProviderHours;
  status: ProviderStatus;
  animals: AnimalSpecies[];
  services: ProviderService[];
  facilities: string[];
  rating?: {
    value: number;
    count: number;
  };
  typeSpecific?: TypeSpecificMetadata;
  photos: string[];
  about: string;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  pincode?: string;
  category?: ProviderType | 'all';
  openNow?: boolean;
  emergency24x7?: boolean;
  maxDistanceKm?: number; // 1, 3, 5, 10, 25
  animals?: AnimalSpecies[];
  service?: string;
  verifiedOnly?: boolean;
  minRating4?: boolean;
  feeRange?: 'under_500' | '500_1000' | 'above_1000' | 'all';
  // Type-specific facets
  hasCctv?: boolean;
  cageFree?: boolean;
  vaccinationRequired?: boolean;
  homeSampleCollection?: boolean;
  hasOxygen?: boolean;
  acceptsDonations?: boolean;
  acceptsAdoption?: boolean;
  sort?: 'best_match' | 'nearest' | 'open_now' | 'rating' | 'fee_asc';
}

export interface CorrectionSubmission {
  providerId: string;
  providerName: string;
  reason: 
    | 'phone_number'
    | 'address_location'
    | 'hours'
    | 'services_fees'
    | 'permanently_closed'
    | 'duplicate'
    | 'other';
  details: string;
  proofFileName?: string;
  reporterContact?: string;
  consent: boolean;
  referenceId: string;
  createdAt: string;
}

export interface ListBusinessDraft {
  step: number;
  name: string;
  types: ProviderType[];
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  hoursMode: 'standard' | '24x7' | 'custom';
  openTime: string;
  closeTime: string;
  hasEmergencyHours: boolean;
  emergencyHoursText?: string;
  animals: AnimalSpecies[];
  services: string[];
  minFee?: number;
  registrationNumber?: string;
  ownerName: string;
  ownerRole: string;
  mockUploadedDoc?: string;
  consent: boolean;
}
