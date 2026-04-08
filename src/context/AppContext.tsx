import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Car, Customer, Booking, Transport, ServiceRecord } from '../types';
import { INITIAL_CARS, INITIAL_CUSTOMERS, INITIAL_BOOKINGS, INITIAL_TRANSPORTS, INITIAL_SERVICE_RECORDS } from '../data/mockData';

interface AppContextValue {
  cars: Car[];
  customers: Customer[];
  bookings: Booking[];
  transports: Transport[];
  serviceRecords: ServiceRecord[];
  addCar: (car: Car) => void;
  updateCar: (car: Car) => void;
  deleteCar: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (id: string) => void;
  addTransport: (transport: Transport) => void;
  updateTransport: (transport: Transport) => void;
  deleteTransport: (id: string) => void;
  addServiceRecord: (record: ServiceRecord) => void;
  updateServiceRecord: (record: ServiceRecord) => void;
  deleteServiceRecord: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>(() => loadFromStorage('cars', INITIAL_CARS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('customers', INITIAL_CUSTOMERS));
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage('bookings', INITIAL_BOOKINGS));
  const [transports, setTransports] = useState<Transport[]>(() => loadFromStorage('transports', INITIAL_TRANSPORTS));
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>(() => loadFromStorage('serviceRecords', INITIAL_SERVICE_RECORDS));

  useEffect(() => { saveToStorage('cars', cars); }, [cars]);
  useEffect(() => { saveToStorage('customers', customers); }, [customers]);
  useEffect(() => { saveToStorage('bookings', bookings); }, [bookings]);
  useEffect(() => { saveToStorage('transports', transports); }, [transports]);
  useEffect(() => { saveToStorage('serviceRecords', serviceRecords); }, [serviceRecords]);

  const addCar = (car: Car) => setCars(prev => [...prev, car]);
  const updateCar = (car: Car) => setCars(prev => prev.map(c => c.id === car.id ? car : c));
  const deleteCar = (id: string) => setCars(prev => prev.filter(c => c.id !== id));

  const addCustomer = (customer: Customer) => setCustomers(prev => [...prev, customer]);
  const updateCustomer = (customer: Customer) => setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
  const deleteCustomer = (id: string) => setCustomers(prev => prev.filter(c => c.id !== id));

  const addBooking = (booking: Booking) => setBookings(prev => [...prev, booking]);
  const updateBooking = (booking: Booking) => setBookings(prev => prev.map(b => b.id === booking.id ? booking : b));
  const deleteBooking = (id: string) => setBookings(prev => prev.filter(b => b.id !== id));

  const addTransport = (transport: Transport) => setTransports(prev => [...prev, transport]);
  const updateTransport = (transport: Transport) => setTransports(prev => prev.map(t => t.id === transport.id ? transport : t));
  const deleteTransport = (id: string) => setTransports(prev => prev.filter(t => t.id !== id));

  const addServiceRecord = (record: ServiceRecord) => setServiceRecords(prev => [...prev, record]);
  const updateServiceRecord = (record: ServiceRecord) => setServiceRecords(prev => prev.map(r => r.id === record.id ? record : r));
  const deleteServiceRecord = (id: string) => setServiceRecords(prev => prev.filter(r => r.id !== id));

  return (
    <AppContext.Provider value={{
      cars, customers, bookings, transports, serviceRecords,
      addCar, updateCar, deleteCar,
      addCustomer, updateCustomer, deleteCustomer,
      addBooking, updateBooking, deleteBooking,
      addTransport, updateTransport, deleteTransport,
      addServiceRecord, updateServiceRecord, deleteServiceRecord,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
