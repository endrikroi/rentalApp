import type {
  BookingStatus,
  CarStatus,
  CarCategory,
  LocationType,
  TransportStatus,
  TransportType,
  ServiceType,
} from '../types';

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

export const CAR_STATUS_COLORS: Record<CarStatus, string> = {
  available: 'bg-green-100 text-green-700',
  rented: 'bg-orange-100 text-orange-700',
  maintenance: 'bg-red-100 text-red-700',
};

export const TRANSPORT_STATUS_COLORS: Record<TransportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export const TRANSPORT_TYPE_COLORS: Record<TransportType, string> = {
  delivery: 'bg-blue-100 text-blue-700',
  'return-pickup': 'bg-purple-100 text-purple-700',
};

export const LOCATION_LABELS: Record<LocationType, string> = {
  office: 'Office',
  airport: 'Airport',
  hotel: 'Hotel',
  custom: 'Custom',
};

export const CAR_CATEGORIES: CarCategory[] = [
  'economy',
  'compact',
  'sedan',
  'suv',
  'luxury',
  'van',
];

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  'oil-change': 'Oil Change',
  'tire-rotation': 'Tire Rotation',
  'brake-service': 'Brake Service',
  'full-inspection': 'Full Inspection',
  'air-filter': 'Air Filter',
  'battery': 'Battery',
  'transmission': 'Transmission',
  'ac-service': 'A/C Service',
  'other': 'Other',
};

export const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  'oil-change': 'bg-amber-100 text-amber-700',
  'tire-rotation': 'bg-blue-100 text-blue-700',
  'brake-service': 'bg-red-100 text-red-700',
  'full-inspection': 'bg-purple-100 text-purple-700',
  'air-filter': 'bg-cyan-100 text-cyan-700',
  'battery': 'bg-yellow-100 text-yellow-700',
  'transmission': 'bg-orange-100 text-orange-700',
  'ac-service': 'bg-sky-100 text-sky-700',
  'other': 'bg-slate-100 text-slate-600',
};
