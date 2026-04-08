import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import type { Booking, BookingStatus, LocationType } from '../types';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { BOOKING_STATUS_COLORS as STATUS_COLORS, LOCATION_LABELS } from '../constants';
import { useTranslation } from 'react-i18next';

const EMPTY_FORM: Omit<Booking, 'id' | 'createdAt' | 'totalPrice'> = {
  customerId: '',
  carId: '',
  startDate: '',
  endDate: '',
  pickupLocationType: 'office',
  pickupLocationDetail: 'Main Office',
  returnLocationType: 'office',
  returnLocationDetail: 'Main Office',
  status: 'confirmed',
  dailyRate: 0,
  notes: '',
};

function generateId() {
  return 'b' + Date.now().toString(36);
}

function calcTotal(startDate: string, endDate: string, dailyRate: number): number {
  if (!startDate || !endDate || !dailyRate) return 0;
  const days = differenceInDays(parseISO(endDate), parseISO(startDate));
  return Math.max(0, days) * dailyRate;
}

interface BookingFormProps {
  initial: Omit<Booking, 'id' | 'createdAt' | 'totalPrice'>;
  onSave: (data: Omit<Booking, 'id' | 'createdAt' | 'totalPrice'>) => void;
  onCancel: () => void;
}

function BookingForm({ initial, onSave, onCancel }: BookingFormProps) {
  const { cars, customers } = useAppContext();
  const { t } = useTranslation();
  const [form, setForm] = useState(initial);

  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'carId') {
        const car = cars.find(c => c.id === value);
        updated.dailyRate = car?.dailyRate ?? 0;
      }
      return updated;
    });

  const total = calcTotal(form.startDate, form.endDate, form.dailyRate);
  const availableCars = cars.filter(c => c.status === 'available' || c.id === initial.carId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.customer')} *</label>
          <select
            required
            value={form.customerId}
            onChange={e => set('customerId', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('bookings.form.selectCustomer')}</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.car')} *</label>
          <select
            required
            value={form.carId}
            onChange={e => set('carId', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('bookings.form.selectCar')}</option>
            {availableCars.map(c => (
              <option key={c.id} value={c.id}>{c.make} {c.model} – {c.plate} (${c.dailyRate}/day)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.startDate')} *</label>
          <input
            required
            type="date"
            value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.endDate')} *</label>
          <input
            required
            type="date"
            value={form.endDate}
            min={form.startDate}
            onChange={e => set('endDate', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.pickupLocationType')}</label>
          <select
            value={form.pickupLocationType}
            onChange={e => set('pickupLocationType', e.target.value as LocationType)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Object.keys(LOCATION_LABELS) as LocationType[]).map(k => (
              <option key={k} value={k}>{LOCATION_LABELS[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.pickupLocationDetail')}</label>
          <input
            type="text"
            value={form.pickupLocationDetail}
            onChange={e => set('pickupLocationDetail', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Terminal 2, Gate B"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.returnLocationType')}</label>
          <select
            value={form.returnLocationType}
            onChange={e => set('returnLocationType', e.target.value as LocationType)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Object.keys(LOCATION_LABELS) as LocationType[]).map(k => (
              <option key={k} value={k}>{LOCATION_LABELS[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.returnLocationDetail')}</label>
          <input
            type="text"
            value={form.returnLocationDetail}
            onChange={e => set('returnLocationDetail', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Main Office"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.status')}</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value as BookingStatus)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="confirmed">{t('bookings.status.confirmed')}</option>
            <option value="active">{t('bookings.status.active')}</option>
            <option value="completed">{t('bookings.status.completed')}</option>
            <option value="cancelled">{t('bookings.status.cancelled')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.dailyRate')}</label>
          <input
            type="number"
            min="0"
            value={form.dailyRate}
            onChange={e => set('dailyRate', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {total > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
          {t('bookings.form.estimatedTotal')}: <strong>${total.toLocaleString()}</strong> ({differenceInDays(parseISO(form.endDate), parseISO(form.startDate))} {t('bookings.form.days')} × ${form.dailyRate})
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('bookings.form.notes')}</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Any special requests or notes..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
          {t('common.cancel')}
        </button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          {t('bookings.saveBooking')}
        </button>
      </div>
    </form>
  );
}

export default function Bookings() {
  const { bookings, cars, customers, addBooking, updateBooking, deleteBooking } = useAppContext();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; booking?: Booking } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getCustomerName = (id: string) => {
    const c = customers.find(cu => cu.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  };
  const getCarLabel = (id: string) => {
    const c = cars.find(car => car.id === id);
    return c ? `${c.make} ${c.model} (${c.plate})` : 'Unknown';
  };

  const filtered = bookings.filter(b => {
    const customerName = getCustomerName(b.customerId).toLowerCase();
    const carLabel = getCarLabel(b.carId).toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || customerName.includes(q) || carLabel.includes(q);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleSave = (data: Omit<Booking, 'id' | 'createdAt' | 'totalPrice'>) => {
    const total = calcTotal(data.startDate, data.endDate, data.dailyRate);
    if (modal?.mode === 'edit' && modal.booking) {
      updateBooking({ ...modal.booking, ...data, totalPrice: total });
    } else {
      addBooking({ ...data, id: generateId(), createdAt: new Date().toISOString(), totalPrice: total });
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    deleteBooking(id);
    setConfirmDelete(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('bookings.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('bookings.subtitle_other', { count: bookings.length })}</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('bookings.newBooking')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('bookings.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['all', 'confirmed', 'active', 'completed', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
              }`}
            >
              {s === 'all' ? t('bookings.status.all') : t(`bookings.status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-medium">{t('bookings.customer')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('bookings.car')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('bookings.period')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('bookings.pickup')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('bookings.return')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('bookings.statusHeader')}</th>
                <th className="text-right px-5 py-3 font-medium">{t('bookings.total')}</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">{t('bookings.noBookings')}</td>
                </tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{getCustomerName(b.customerId)}</td>
                    <td className="px-5 py-3 text-slate-600">{getCarLabel(b.carId)}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {format(parseISO(b.startDate), 'MMM d')} &ndash; {format(parseISO(b.endDate), 'MMM d, yy')}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">{LOCATION_LABELS[b.pickupLocationType]}</span>
                      <span className="text-xs text-slate-400 ml-1">{b.pickupLocationDetail}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">{LOCATION_LABELS[b.returnLocationType]}</span>
                      <span className="text-xs text-slate-400 ml-1">{b.returnLocationDetail}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-800">${b.totalPrice.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setModal({ mode: 'edit', booking: b })}
                          className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(b.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? t('bookings.addTitle') : t('bookings.editTitle')}
          onClose={() => setModal(null)}
          size="lg"
        >
          <BookingForm
            initial={modal.booking ? {
              customerId: modal.booking.customerId,
              carId: modal.booking.carId,
              startDate: modal.booking.startDate,
              endDate: modal.booking.endDate,
              pickupLocationType: modal.booking.pickupLocationType,
              pickupLocationDetail: modal.booking.pickupLocationDetail,
              returnLocationType: modal.booking.returnLocationType,
              returnLocationDetail: modal.booking.returnLocationDetail,
              status: modal.booking.status,
              dailyRate: modal.booking.dailyRate,
              notes: modal.booking.notes ?? '',
            } : EMPTY_FORM}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title={t('bookings.deleteTitle')} onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-slate-600 mb-4">{t('bookings.deleteConfirm')}</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">{t('common.cancel')}</button>
            <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">{t('common.delete')}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
