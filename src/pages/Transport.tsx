import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import type { Transport, TransportType, TransportStatus } from '../types';
import { Plus, Pencil, Trash2, Search, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { TRANSPORT_STATUS_COLORS as STATUS_COLORS, TRANSPORT_TYPE_COLORS as TYPE_COLORS } from '../constants';

function generateId() {
  return 't' + Date.now().toString(36);
}

const EMPTY_FORM: Omit<Transport, 'id'> = {
  bookingId: '',
  type: 'delivery',
  address: '',
  scheduledDateTime: '',
  driverName: '',
  status: 'pending',
  notes: '',
};

interface TransportFormProps {
  initial: Omit<Transport, 'id'>;
  onSave: (data: Omit<Transport, 'id'>) => void;
  onCancel: () => void;
}

function TransportForm({ initial, onSave, onCancel }: TransportFormProps) {
  const { bookings, cars, customers } = useAppContext();
  const [form, setForm] = useState(initial);
  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed');

  const getBookingLabel = (bookingId: string) => {
    const b = bookings.find(bk => bk.id === bookingId);
    if (!b) return '';
    const car = cars.find(c => c.id === b.carId);
    const customer = customers.find(c => c.id === b.customerId);
    return `${customer?.firstName} ${customer?.lastName} – ${car?.make} ${car?.model} (${b.startDate} → ${b.endDate})`;
  };

  const localValue = form.scheduledDateTime
    ? form.scheduledDateTime.slice(0, 16)
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Booking *</label>
        <select
          required
          value={form.bookingId}
          onChange={e => set('bookingId', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select booking...</option>
          {activeBookings.map(b => (
            <option key={b.id} value={b.id}>{getBookingLabel(b.id)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value as TransportType)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="delivery">Delivery (to customer)</option>
            <option value="return-pickup">Return Pickup (from customer)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value as TransportStatus)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Address / Location *</label>
        <input
          required
          type="text"
          value={form.address}
          onChange={e => set('address', e.target.value)}
          placeholder="e.g. Terminal 2, International Airport"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date & Time *</label>
          <input
            required
            type="datetime-local"
            value={localValue}
            onChange={e => set('scheduledDateTime', new Date(e.target.value).toISOString())}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Driver Name</label>
          <input
            type="text"
            value={form.driverName}
            onChange={e => set('driverName', e.target.value)}
            placeholder="e.g. Carlos M."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Special instructions..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Task</button>
      </div>
    </form>
  );
}

function groupByDate(transports: Transport[]) {
  const groups: Record<string, Transport[]> = {};
  [...transports]
    .sort((a, b) => a.scheduledDateTime.localeCompare(b.scheduledDateTime))
    .forEach(t => {
      const key = t.scheduledDateTime.slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
  return groups;
}

export default function TransportPage() {
  const { transports, bookings, cars, customers, addTransport, updateTransport, deleteTransport } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransportStatus | 'all'>('all');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; transport?: Transport } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getBookingInfo = (bookingId: string) => {
    const b = bookings.find(bk => bk.id === bookingId);
    if (!b) return { car: '—', customer: '—' };
    const car = cars.find(c => c.id === b.carId);
    const customer = customers.find(c => c.id === b.customerId);
    return {
      car: car ? `${car.make} ${car.model} (${car.plate})` : '—',
      customer: customer ? `${customer.firstName} ${customer.lastName}` : '—',
    };
  };

  const filtered = transports.filter(t => {
    const info = getBookingInfo(t.bookingId);
    const q = search.toLowerCase();
    const matchSearch = !q || info.car.toLowerCase().includes(q) || info.customer.toLowerCase().includes(q) || t.address.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const grouped = groupByDate(filtered);

  const handleSave = (data: Omit<Transport, 'id'>) => {
    if (modal?.mode === 'edit' && modal.transport) {
      updateTransport({ ...modal.transport, ...data });
    } else {
      addTransport({ ...data, id: generateId() });
    }
    setModal(null);
  };

  const markComplete = (t: Transport) => {
    updateTransport({ ...t, status: 'completed' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transport</h1>
          <p className="text-slate-500 text-sm mt-1">
            {transports.filter(t => t.status === 'pending' || t.status === 'in-progress').length} pending tasks
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
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
            placeholder="Search car, customer, or address..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'in-progress', 'completed', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
              }`}
            >
              {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
          <Truck className="w-10 h-10 mb-3" />
          <p>No transport tasks found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, tasks]) => {
            const date = parseISO(dateKey);
            const isT = isToday(date);
            return (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className={`text-sm font-semibold ${isT ? 'text-blue-700' : 'text-slate-500'}`}>
                    {isT ? 'TODAY – ' : ''}{format(date, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <div className={`h-px flex-1 ${isT ? 'bg-blue-200' : 'bg-slate-200'}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isT ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.map(t => {
                    const info = getBookingInfo(t.bookingId);
                    return (
                      <div
                        key={t.id}
                        className={`bg-white rounded-xl border px-5 py-4 flex items-start gap-4 ${
                          t.status === 'completed' ? 'border-slate-200 opacity-60' : 'border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${TYPE_COLORS[t.type]}`}>
                          {t.type === 'delivery' ? <Truck className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[t.type]}`}>
                              {t.type === 'delivery' ? 'Delivery' : 'Return Pickup'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status]}`}>
                              {t.status === 'in-progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="font-semibold text-slate-800 text-sm">{info.car}</span>
                            <span className="text-slate-400 text-xs">&bull;</span>
                            <span className="text-slate-600 text-sm">{info.customer}</span>
                          </div>

                          <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {t.address}
                          </div>

                          <div className="flex items-center gap-4 mt-1 flex-wrap text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(t.scheduledDateTime), 'HH:mm')}
                            </span>
                            {t.driverName && <span>Driver: <strong className="text-slate-600">{t.driverName}</strong></span>}
                            {t.notes && <span className="italic">{t.notes}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {t.status === 'pending' && (
                            <button
                              onClick={() => markComplete(t)}
                              title="Mark as completed"
                              className="p-1.5 rounded text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setModal({ mode: 'edit', transport: t })}
                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(t.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'New Transport Task' : 'Edit Transport Task'}
          onClose={() => setModal(null)}
          size="md"
        >
          <TransportForm
            initial={modal.transport ? {
              bookingId: modal.transport.bookingId,
              type: modal.transport.type,
              address: modal.transport.address,
              scheduledDateTime: modal.transport.scheduledDateTime,
              driverName: modal.transport.driverName ?? '',
              status: modal.transport.status,
              notes: modal.transport.notes ?? '',
            } : EMPTY_FORM}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Task" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-slate-600 mb-4">Delete this transport task? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => { deleteTransport(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
