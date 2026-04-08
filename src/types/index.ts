export type CarStatus = 'available' | 'rented' | 'maintenance';
export type CarCategory = 'economy' | 'compact' | 'sedan' | 'suv' | 'luxury' | 'van';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  category: CarCategory;
  status: CarStatus;
  dailyRate: number;
  notes?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  driverLicense: string;
  notes?: string;
  createdAt: string;
}

export type BookingStatus = 'confirmed' | 'active' | 'completed' | 'cancelled';
export type LocationType = 'office' | 'airport' | 'hotel' | 'custom';

export interface Booking {
  id: string;
  customerId: string;
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocationType: LocationType;
  pickupLocationDetail: string;
  returnLocationType: LocationType;
  returnLocationDetail: string;
  status: BookingStatus;
  dailyRate: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export type TransportType = 'delivery' | 'return-pickup';
export type TransportStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Transport {
  id: string;
  bookingId: string;
  type: TransportType;
  address: string;
  scheduledDateTime: string;
  driverName?: string;
  status: TransportStatus;
  notes?: string;
}

export type ServiceType =
  | 'oil-change'
  | 'tire-rotation'
  | 'brake-service'
  | 'full-inspection'
  | 'air-filter'
  | 'battery'
  | 'transmission'
  | 'ac-service'
  | 'other';

export interface ServiceRecord {
  id: string;
  carId: string;
  date: string;
  serviceType: ServiceType;
  odometer: number;
  nextServiceOdometer?: number;
  nextServiceDate?: string;
  cost: number;
  provider: string;
  technician?: string;
  partsReplaced?: string;
  notes?: string;
  createdAt: string;
}
