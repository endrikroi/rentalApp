import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import type { Car, CarStatus, CarCategory } from '../types';
import { Plus, Pencil, Trash2, Search, Car as CarIcon, Wrench, CheckCircle } from 'lucide-react';
import { CAR_STATUS_COLORS as STATUS_COLORS, CAR_CATEGORIES as CATEGORIES } from '../constants';

const STATUS_ICONS: Record<CarStatus, React.ComponentType<{ className?: string }>> = {
  available: CheckCircle,
  rented: CarIcon,
  maintenance: Wrench,
};

const EMPTY_FORM: Omit<Car, 'id'> = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  color: '',
  category: 'compact',
  status: 'available',
  dailyRate: 0,
  notes: '',
};

function generateId() {
  return 'c' + Date.now().toString(36);
}

interface CarFormProps {
  initial: Omit<Car, 'id'>;
  onSave: (data: Omit<Car, 'id'>) => void;
  onCancel: () => void;
}

function CarForm({ initial, onSave, onCancel }: CarFormProps) {
  const [form, setForm] = useState(initial);
  const set = (field: keyof typeof form, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Make *</label>
          <input
            required
            type="text"
            value={form.make}
            onChange={e => set('make', e.target.value)}
            placeholder="e.g. Toyota"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
          <input
            required
            type="text"
            value={form.model}
            onChange={e => set('model', e.target.value)}
            placeholder="e.g. Corolla"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
          <input
            required
            type="number"
            min={1990}
            max={new Date().getFullYear() + 1}
            value={form.year}
            onChange={e => set('year', parseInt(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">License Plate *</label>
          <input
            required
            type="text"
            value={form.plate}
            onChange={e => set('plate', e.target.value.toUpperCase())}
            placeholder="e.g. ABC-1234"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
          <input
            type="text"
            value={form.color}
            onChange={e => set('color', e.target.value)}
            placeholder="e.g. White"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value as CarCategory)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value as CarStatus)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Daily Rate ($)</label>
          <input
            required
            type="number"
            min={0}
            value={form.dailyRate}
            onChange={e => set('dailyRate', parseFloat(e.target.value))}
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
          placeholder="e.g. Maintenance schedule, special features..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Car</button>
      </div>
    </form>
  );
}

export default function Fleet() {
  const { cars, bookings, addCar, updateCar, deleteCar } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CarStatus | 'all'>('all');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; car?: Car } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getActiveBooking = (carId: string) =>
    bookings.find(b => b.carId === carId && (b.status === 'active' || b.status === 'confirmed'));

  const filtered = cars.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${c.make} ${c.model} ${c.plate} ${c.color}`.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: Omit<Car, 'id'>) => {
    if (modal?.mode === 'edit' && modal.car) {
      updateCar({ ...modal.car, ...data });
    } else {
      addCar({ ...data, id: generateId() });
    }
    setModal(null);
  };

  const stats = {
    available: cars.filter(c => c.status === 'available').length,
    rented: cars.filter(c => c.status === 'rented').length,
    maintenance: cars.filter(c => c.status === 'maintenance').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fleet</h1>
          <p className="text-slate-500 text-sm mt-1">{cars.length} vehicles total</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['available', 'rented', 'maintenance'] as CarStatus[]).map(s => {
          const Icon = STATUS_ICONS[s];
          const colors: Record<CarStatus, string> = {
            available: 'bg-green-50 border-green-200 text-green-700',
            rented: 'bg-orange-50 border-orange-200 text-orange-700',
            maintenance: 'bg-red-50 border-red-200 text-red-700',
          };
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                statusFilter === s ? colors[s] + ' ring-2 ring-offset-1' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div>
                <div className="text-2xl font-bold">{stats[s]}</div>
                <div className="text-sm capitalize">{s}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by make, model, plate, color..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-medium">Vehicle</th>
                <th className="text-left px-5 py-3 font-medium">Plate</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Color</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Current Booking</th>
                <th className="text-right px-5 py-3 font-medium">Rate/day</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">No vehicles found</td>
                </tr>
              ) : (
                filtered.map(car => {
                  const activeBooking = getActiveBooking(car.id);
                  return (
                    <tr key={car.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800">{car.year} {car.make} {car.model}</div>
                        {car.notes && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-48">{car.notes}</div>}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 bg-slate-50 whitespace-nowrap">{car.plate}</td>
                      <td className="px-5 py-3 text-slate-600 capitalize">{car.category}</td>
                      <td className="px-5 py-3 text-slate-600">{car.color}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[car.status]}`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">
                        {activeBooking
                          ? <span className="text-blue-600 font-medium">#{activeBooking.id} ({activeBooking.status})</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-800">${car.dailyRate}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setModal({ mode: 'edit', car })}
                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(car.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
          onClose={() => setModal(null)}
          size="md"
        >
          <CarForm
            initial={modal.car ? {
              make: modal.car.make, model: modal.car.model, year: modal.car.year,
              plate: modal.car.plate, color: modal.car.color, category: modal.car.category,
              status: modal.car.status, dailyRate: modal.car.dailyRate, notes: modal.car.notes ?? '',
            } : EMPTY_FORM}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Remove Vehicle" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-slate-600 mb-4">Are you sure you want to remove this vehicle from the fleet?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => { deleteCar(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Remove</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
