import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import type { Customer } from '../types';
import { BOOKING_STATUS_COLORS as STATUS_COLORS } from '../constants';
import { Plus, Pencil, Trash2, Search, User, Phone, Mail, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

function generateId() {
  return 'cu' + Date.now().toString(36);
}

const EMPTY_FORM: Omit<Customer, 'id' | 'createdAt'> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  driverLicense: '',
  notes: '',
};

interface CustomerFormProps {
  initial: Omit<Customer, 'id' | 'createdAt'>;
  onSave: (data: Omit<Customer, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function CustomerForm({ initial, onSave, onCancel }: CustomerFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial);
  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.form.firstName')} *</label>
          <input
            required
            type="text"
            value={form.firstName}
            onChange={e => set('firstName', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.form.lastName')} *</label>
          <input
            required
            type="text"
            value={form.lastName}
            onChange={e => set('lastName', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.form.email')} *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.form.phone')} *</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+1 555-0000"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.form.driverLicense')} *</label>
          <input
            required
            type="text"
            value={form.driverLicense}
            onChange={e => set('driverLicense', e.target.value.toUpperCase())}
            placeholder="e.g. DL-112233"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.form.notes')}</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Any additional notes..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">{t('common.cancel')}</button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">{t('customers.saveCustomer')}</button>
      </div>
    </form>
  );
}

export default function Customers() {
  const { customers, bookings, cars, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; customer?: Customer } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q);
  });

  const getCustomerBookings = (customerId: string) =>
    bookings.filter(b => b.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const getCarLabel = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    return car ? `${car.make} ${car.model} (${car.plate})` : '—';
  };

  const handleSave = (data: Omit<Customer, 'id' | 'createdAt'>) => {
    if (modal?.mode === 'edit' && modal.customer) {
      updateCustomer({ ...modal.customer, ...data });
    } else {
      addCustomer({ ...data, id: generateId(), createdAt: new Date().toISOString() });
    }
    setModal(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('customers.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('customers.subtitle_other', { count: customers.length })}</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('customers.addCustomer')}
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
            placeholder={t('customers.searchPlaceholder')}
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
            <User className="w-10 h-10 mb-3" />
            <p>{t('customers.noCustomers')}</p>
          </div>
        ) : (
          filtered.map(customer => {
            const customerBookings = getCustomerBookings(customer.id);
            const activeBooking = customerBookings.find(b => b.status === 'active' || b.status === 'confirmed');
            return (
              <div key={customer.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
                      {customer.firstName[0]}{customer.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{customer.firstName} {customer.lastName}</p>
                      <p className="text-xs text-slate-400">{t('customers.customerSince')} {format(parseISO(customer.createdAt), 'MMM yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModal({ mode: 'edit', customer })}
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(customer.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-xs">{customer.driverLicense}</span>
                  </div>
                </div>

                {activeBooking && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-green-700 font-medium">
                      {t('customers.currentlyRenting')}: {getCarLabel(activeBooking.carId)}
                    </p>
                    <p className="text-xs text-green-600">
                      {t('customers.until')} {format(parseISO(activeBooking.endDate), 'd MMM yyyy')}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t('customers.bookings_other', { count: customerBookings.length })}</span>
                  {customerBookings.length > 0 && (
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {t('customers.viewHistory')}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? t('customers.addTitle') : t('customers.editTitle')}
          onClose={() => setModal(null)}
          size="md"
        >
          <CustomerForm
            initial={modal.customer ? {
              firstName: modal.customer.firstName,
              lastName: modal.customer.lastName,
              email: modal.customer.email,
              phone: modal.customer.phone,
              driverLicense: modal.customer.driverLicense,
              notes: modal.customer.notes ?? '',
            } : EMPTY_FORM}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {selectedCustomer && (
        <Modal
          title={`${t('customers.bookingHistory')} – ${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
          onClose={() => setSelectedCustomer(null)}
          size="lg"
        >
          <div className="space-y-2">
            {getCustomerBookings(selectedCustomer.id).map(b => (
              <div key={b.id} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{getCarLabel(b.carId)}</p>
                  <p className="text-xs text-slate-500">
                    {format(parseISO(b.startDate), 'd MMM')} &ndash; {format(parseISO(b.endDate), 'd MMM yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[b.status]}`}>
                    {b.status}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">${b.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title={t('customers.deleteTitle')} onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-slate-600 mb-4">{t('customers.deleteConfirm')}</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">{t('common.cancel')}</button>
            <button onClick={() => { deleteCustomer(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">{t('common.delete')}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
