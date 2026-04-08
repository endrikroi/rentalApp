import type { Car, Customer, Booking, Transport, ServiceRecord } from '../types';

export const INITIAL_CARS: Car[] = [
  { id: 'c1', make: 'Toyota', model: 'Corolla', year: 2022, plate: 'ABC-1234', color: 'White', category: 'compact', status: 'available', dailyRate: 45 },
  { id: 'c2', make: 'BMW', model: '3 Series', year: 2023, plate: 'XYZ-5678', color: 'Black', category: 'sedan', status: 'rented', dailyRate: 110 },
  { id: 'c3', make: 'Mercedes', model: 'GLE', year: 2022, plate: 'MBZ-9012', color: 'Silver', category: 'suv', status: 'rented', dailyRate: 160 },
  { id: 'c4', make: 'Volkswagen', model: 'Golf', year: 2021, plate: 'VWG-3456', color: 'Blue', category: 'compact', status: 'maintenance', dailyRate: 55, notes: 'Brake service scheduled' },
  { id: 'c5', make: 'Audi', model: 'A6', year: 2023, plate: 'AUD-7890', color: 'Grey', category: 'luxury', status: 'available', dailyRate: 130 },
  { id: 'c6', make: 'Ford', model: 'Transit', year: 2022, plate: 'FRD-2345', color: 'White', category: 'van', status: 'available', dailyRate: 95 },
  { id: 'c7', make: 'Toyota', model: 'Yaris', year: 2023, plate: 'TYT-6789', color: 'Red', category: 'economy', status: 'rented', dailyRate: 35 },
  { id: 'c8', make: 'Hyundai', model: 'Tucson', year: 2022, plate: 'HYN-0123', color: 'White', category: 'suv', status: 'available', dailyRate: 85 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cu1', firstName: 'James', lastName: 'Miller', email: 'james.miller@email.com', phone: '+1 555-0101', driverLicense: 'DL-112233', createdAt: '2026-01-10T09:00:00Z' },
  { id: 'cu2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '+1 555-0202', driverLicense: 'DL-445566', createdAt: '2026-01-15T10:30:00Z' },
  { id: 'cu3', firstName: 'Michael', lastName: 'Brown', email: 'm.brown@email.com', phone: '+1 555-0303', driverLicense: 'DL-778899', createdAt: '2026-02-02T14:00:00Z' },
  { id: 'cu4', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com', phone: '+1 555-0404', driverLicense: 'DL-001122', createdAt: '2026-02-20T11:00:00Z' },
  { id: 'cu5', firstName: 'Robert', lastName: 'Wilson', email: 'r.wilson@email.com', phone: '+1 555-0505', driverLicense: 'DL-334455', createdAt: '2026-03-05T08:45:00Z' },
  { id: 'cu6', firstName: 'Lisa', lastName: 'Martinez', email: 'lisa.m@email.com', phone: '+1 555-0606', driverLicense: 'DL-667788', createdAt: '2026-03-18T15:20:00Z' },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1', customerId: 'cu1', carId: 'c2',
    startDate: '2026-04-06', endDate: '2026-04-14',
    pickupLocationType: 'airport', pickupLocationDetail: 'Terminal 2, International Airport',
    returnLocationType: 'office', returnLocationDetail: 'Main Office',
    status: 'active', dailyRate: 110, totalPrice: 880,
    createdAt: '2026-04-01T09:00:00Z',
  },
  {
    id: 'b2', customerId: 'cu2', carId: 'c3',
    startDate: '2026-04-05', endDate: '2026-04-12',
    pickupLocationType: 'hotel', pickupLocationDetail: 'Grand Hotel, 123 Main St',
    returnLocationType: 'airport', returnLocationDetail: 'Terminal 1',
    status: 'active', dailyRate: 160, totalPrice: 1120,
    createdAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'b3', customerId: 'cu3', carId: 'c7',
    startDate: '2026-04-08', endDate: '2026-04-10',
    pickupLocationType: 'office', pickupLocationDetail: 'Main Office',
    returnLocationType: 'office', returnLocationDetail: 'Main Office',
    status: 'confirmed', dailyRate: 35, totalPrice: 70,
    createdAt: '2026-04-03T14:00:00Z',
  },
  {
    id: 'b4', customerId: 'cu4', carId: 'c5',
    startDate: '2026-04-10', endDate: '2026-04-18',
    pickupLocationType: 'airport', pickupLocationDetail: 'Terminal 3, City Airport',
    returnLocationType: 'hotel', returnLocationDetail: 'Hilton Downtown',
    status: 'confirmed', dailyRate: 130, totalPrice: 1040,
    notes: 'Customer requests child seat',
    createdAt: '2026-04-04T11:00:00Z',
  },
  {
    id: 'b5', customerId: 'cu5', carId: 'c1',
    startDate: '2026-03-20', endDate: '2026-03-28',
    pickupLocationType: 'office', pickupLocationDetail: 'Main Office',
    returnLocationType: 'office', returnLocationDetail: 'Main Office',
    status: 'completed', dailyRate: 45, totalPrice: 360,
    createdAt: '2026-03-15T08:00:00Z',
  },
  {
    id: 'b6', customerId: 'cu6', carId: 'c8',
    startDate: '2026-04-12', endDate: '2026-04-15',
    pickupLocationType: 'hotel', pickupLocationDetail: 'Marriott City Center',
    returnLocationType: 'airport', returnLocationDetail: 'Terminal 1',
    status: 'confirmed', dailyRate: 85, totalPrice: 255,
    createdAt: '2026-04-05T16:00:00Z',
  },
];

export const INITIAL_TRANSPORTS: Transport[] = [
  {
    id: 't1', bookingId: 'b1', type: 'delivery',
    address: 'Terminal 2, International Airport',
    scheduledDateTime: '2026-04-06T10:00:00Z',
    driverName: 'Carlos M.', status: 'completed',
    notes: 'Gate B12',
  },
  {
    id: 't2', bookingId: 'b2', type: 'delivery',
    address: 'Grand Hotel, 123 Main St',
    scheduledDateTime: '2026-04-05T14:00:00Z',
    driverName: 'Carlos M.', status: 'completed',
  },
  {
    id: 't3', bookingId: 'b3', type: 'delivery',
    address: 'Main Office',
    scheduledDateTime: '2026-04-08T09:00:00Z',
    status: 'pending',
  },
  {
    id: 't4', bookingId: 'b4', type: 'delivery',
    address: 'Terminal 3, City Airport',
    scheduledDateTime: '2026-04-10T08:30:00Z',
    driverName: 'John D.',
    status: 'pending',
    notes: 'Flight arrives at 08:15',
  },
  {
    id: 't5', bookingId: 'b2', type: 'return-pickup',
    address: 'Terminal 1',
    scheduledDateTime: '2026-04-12T16:00:00Z',
    driverName: 'John D.', status: 'pending',
  },
  {
    id: 't6', bookingId: 'b6', type: 'delivery',
    address: 'Marriott City Center',
    scheduledDateTime: '2026-04-12T11:00:00Z',
    status: 'pending',
  },
  {
    id: 't7', bookingId: 'b1', type: 'return-pickup',
    address: 'Main Office',
    scheduledDateTime: '2026-04-14T17:00:00Z',
    status: 'pending',
  },
];

export const INITIAL_SERVICE_RECORDS: ServiceRecord[] = [
  {
    id: 's1', carId: 'c1', date: '2026-02-14',
    serviceType: 'oil-change', odometer: 38500,
    nextServiceOdometer: 43500, nextServiceDate: '2026-08-14',
    cost: 85, provider: 'AutoCare Center', technician: 'Mike T.',
    partsReplaced: 'Oil filter, 5L synthetic oil',
    createdAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 's2', carId: 'c4', date: '2026-04-07',
    serviceType: 'brake-service', odometer: 52100,
    nextServiceOdometer: 72100,
    cost: 320, provider: 'City Garage', technician: 'Anna R.',
    partsReplaced: 'Front brake pads, brake fluid',
    notes: 'Rear brakes at 60% — monitor at next service',
    createdAt: '2026-04-07T09:30:00Z',
  },
  {
    id: 's3', carId: 'c2', date: '2026-01-20',
    serviceType: 'full-inspection', odometer: 21300,
    nextServiceOdometer: 31300, nextServiceDate: '2026-07-20',
    cost: 150, provider: 'BMW Service Center', technician: 'Paul K.',
    notes: 'All systems nominal',
    createdAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 's4', carId: 'c3', date: '2026-03-05',
    serviceType: 'tire-rotation', odometer: 44800,
    nextServiceOdometer: 54800,
    cost: 60, provider: 'SpeedTire Shop',
    createdAt: '2026-03-05T11:00:00Z',
  },
  {
    id: 's5', carId: 'c6', date: '2026-03-28',
    serviceType: 'oil-change', odometer: 61200,
    nextServiceOdometer: 66200, nextServiceDate: '2026-09-28',
    cost: 95, provider: 'AutoCare Center', technician: 'Mike T.',
    partsReplaced: 'Oil filter, 7L synthetic oil',
    createdAt: '2026-03-28T08:00:00Z',
  },
  {
    id: 's6', carId: 'c8', date: '2026-02-01',
    serviceType: 'battery', odometer: 29400,
    cost: 180, provider: 'City Garage', technician: 'Anna R.',
    partsReplaced: 'Hyundai OEM battery 70Ah',
    createdAt: '2026-02-01T13:00:00Z',
  },
  {
    id: 's7', carId: 'c5', date: '2026-01-10',
    serviceType: 'ac-service', odometer: 18700,
    cost: 220, provider: 'Audi Service Center', technician: 'Karl B.',
    partsReplaced: 'Cabin filter, refrigerant refill',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 's8', carId: 'c7', date: '2026-03-15',
    serviceType: 'air-filter', odometer: 12400,
    nextServiceOdometer: 22400,
    cost: 35, provider: 'AutoCare Center',
    partsReplaced: 'Engine air filter',
    createdAt: '2026-03-15T10:30:00Z',
  },
];
