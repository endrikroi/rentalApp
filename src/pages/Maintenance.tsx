import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import type { ServiceRecord, ServiceType } from '../types';
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_COLORS } from '../constants';
import {
  Plus, Pencil, Trash2, Search, Wrench,
  Car as CarIcon, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

const SERVICE_TYPES: ServiceType[] = [
  'oil-change', 'tire-rotation', 'brake-service', 'full-inspection',
  'air-filter', 'battery', 'transmission', 'ac-service', 'other',
];

function generateId() {
  return 's' + Date.now().toString(36);
}

const EMPTY_FORM: Omit<ServiceRecord, 'id' | 'createdAt'> = {
  carId: '',
  date: new Date().toISOString().slice(0, 10),
  serviceType: 'oil-change',
  odometer: 0,
  nextServiceOdometer: undefined,
  nextServiceDate: undefined,
  cost: 0,
  provider: '',
  technician: '',
  partsReplaced: '',
  notes: '',
};

interface ServiceFormProps {
  initial: Omit<ServiceRecord, 'id' | 'createdAt'>;
  onSave: (data: Omit<ServiceRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function ServiceForm({ initial, onSave, onCancel }: ServiceFormProps) {
  const { cars } = useAppContext();
  const { t } = useTranslation();
  const [form, setForm] = useState(initial);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      nextServiceOdometer: form.nextServiceOdometer || undefined,
      nextServiceDate: form.nextServiceDate || undefined,
      technician: form.technician || undefined,
      partsReplaced: form.partsReplaced || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.vehicle')} *</label>
          <select
            required
            value={form.carId}
            onChange={e => setField('carId', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('maintenance.form.selectVehicle')}</option>
            {cars.map(c => (
              <option key={c.id} value={c.id}>
                {c.year} {c.make} {c.model} – {c.plate}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.serviceType')} *</label>
          <select
            required
            value={form.serviceType}
            onChange={e => setField('serviceType', e.target.value as ServiceType)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SERVICE_TYPES.map(t => (
              <option key={t} value={t}>{SERVICE_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.date')} *</label>
          <input
            required
            type="date"
            value={form.date}
            onChange={e => setField('date', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.odometer')} *</label>
          <input
            required
            type="number"
            min={0}
            value={form.odometer}
            onChange={e => setField('odometer', parseInt(e.target.value) || 0)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.cost')} *</label>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={form.cost}
            onChange={e => setField('cost', parseFloat(e.target.value) || 0)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.nextServiceOdometer')}</label>
          <input
            type="number"
            min={0}
            value={form.nextServiceOdometer ?? ''}
            onChange={e => setField('nextServiceOdometer', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g. 50000"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.nextServiceDate')}</label>
          <input
            type="date"
            value={form.nextServiceDate ?? ''}
            onChange={e => setField('nextServiceDate', e.target.value || undefined)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.provider')} *</label>
          <input
            required
            type="text"
            value={form.provider}
            onChange={e => setField('provider', e.target.value)}
            placeholder="e.g. AutoCare Center"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.technician')}</label>
          <input
            type="text"
            value={form.technician ?? ''}
            onChange={e => setField('technician', e.target.value || undefined)}
            placeholder="e.g. Mike T."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.partsReplaced')}</label>
        <input
          type="text"
          value={form.partsReplaced ?? ''}
          onChange={e => setField('partsReplaced', e.target.value || undefined)}
          placeholder="e.g. Oil filter, brake pads..."
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance.form.notes')}</label>
        <textarea
          rows={2}
          value={form.notes ?? ''}
          onChange={e => setField('notes', e.target.value || undefined)}
          placeholder="Any additional observations..."
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
          {t('common.cancel')}
        </button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          {t('maintenance.saveRecord')}
        </button>
      </div>
    </form>
  );
}

function nextServiceWarning(record: ServiceRecord): 'overdue' | 'soon' | null {
  const today = new Date();
  if (record.nextServiceDate) {
    const daysLeft = differenceInDays(parseISO(record.nextServiceDate), today);
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 30) return 'soon';
  }
  return null;
}

export default function Maintenance() {
  const { cars, serviceRecords, addServiceRecord, updateServiceRecord, deleteServiceRecord } = useAppContext();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [carFilter, setCarFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; record?: ServiceRecord } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getCarLabel = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    return car ? `${car.year} ${car.make} ${car.model} (${car.plate})` : '—';
  };

  const filtered = serviceRecords
    .filter(r => {
      const q = search.toLowerCase();
      const carLabel = getCarLabel(r.carId).toLowerCase();
      const matchSearch = !q || carLabel.includes(q) || r.provider.toLowerCase().includes(q) || SERVICE_TYPE_LABELS[r.serviceType].toLowerCase().includes(q);
      const matchCar = carFilter === 'all' || r.carId === carFilter;
      const matchType = typeFilter === 'all' || r.serviceType === typeFilter;
      return matchSearch && matchCar && matchType;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleSave = (data: Omit<ServiceRecord, 'id' | 'createdAt'>) => {
    if (modal?.mode === 'edit' && modal.record) {
      updateServiceRecord({ ...modal.record, ...data });
    } else {
      addServiceRecord({ ...data, id: generateId(), createdAt: new Date().toISOString() });
    }
    setModal(null);
  };

  const totalCost = filtered.reduce((sum, r) => sum + r.cost, 0);
  const overdueCount = serviceRecords.filter(r => nextServiceWarning(r) === 'overdue').length;
  const soonCount = serviceRecords.filter(r => nextServiceWarning(r) === 'soon').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('maintenance.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('maintenance.subtitle_other', { count: serviceRecords.length })}</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('maintenance.logService')}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Wrench className="w-4 h-4 text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-500">{t('maintenance.totalRecords')}</p>
              <p className="text-xl font-bold text-slate-800">{serviceRecords.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600" /></div>
            <div>
              <p className="text-xs text-slate-500">{t('maintenance.totalSpent')}</p>
              <p className="text-xl font-bold text-slate-800">€{totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 ${overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${overdueCount > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
              <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('maintenance.overdueServices')}</p>
              <p className={`text-xl font-bold ${overdueCount > 0 ? 'text-red-700' : 'text-slate-800'}`}>{overdueCount}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 ${soonCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${soonCount > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <CarIcon className={`w-4 h-4 ${soonCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('maintenance.dueWithin30')}</p>
              <p className={`text-xl font-bold ${soonCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>{soonCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('maintenance.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={carFilter}
          onChange={e => setCarFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
        >
          <option value="all">{t('maintenance.allVehicles')}</option>
          {cars.map(c => (
            <option key={c.id} value={c.id}>{c.make} {c.model} ({c.plate})</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as ServiceType | 'all')}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
        >
          <option value="all">{t('maintenance.allServiceTypes')}</option>
          {SERVICE_TYPES.map(t => (
            <option key={t} value={t}>{SERVICE_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-medium">{t('maintenance.vehicle')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('maintenance.service')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('maintenance.date')}</th>
                <th className="text-right px-5 py-3 font-medium">{t('maintenance.odometer')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('maintenance.nextService')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('maintenance.provider')}</th>
                <th className="text-left px-5 py-3 font-medium">{t('maintenance.partsReplaced')}</th>
                <th className="text-right px-5 py-3 font-medium">{t('maintenance.cost')}</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    {t('maintenance.noRecords')}
                  </td>
                </tr>
              ) : (
                filtered.map(record => {
                  const warning = nextServiceWarning(record);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800 whitespace-nowrap">{getCarLabel(record.carId)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${SERVICE_TYPE_COLORS[record.serviceType]}`}>
                          {SERVICE_TYPE_LABELS[record.serviceType]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                        {format(parseISO(record.date), 'd MMM yyyy')}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                        {record.odometer.toLocaleString()} km
                      </td>
                      <td className="px-5 py-3">
                        {record.nextServiceOdometer || record.nextServiceDate ? (
                          <div className={`flex items-center gap-1.5 ${warning === 'overdue' ? 'text-red-600' : warning === 'soon' ? 'text-amber-600' : 'text-slate-500'}`}>
                            {warning && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                            <div>
                              {record.nextServiceOdometer && (
                                <p className="text-xs font-mono">{record.nextServiceOdometer.toLocaleString()} km</p>
                              )}
                              {record.nextServiceDate && (
                                <p className="text-xs">{format(parseISO(record.nextServiceDate), 'd MMM yyyy')}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-slate-700">{record.provider}</p>
                        {record.technician && <p className="text-xs text-slate-400">{record.technician}</p>}
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs max-w-48">
                        <p className="truncate">{record.partsReplaced ?? '—'}</p>
                        {record.notes && <p className="truncate italic text-slate-400">{record.notes}</p>}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                        €{record.cost.toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setModal({ mode: 'edit', record })}
                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(record.id)}
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
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={7} className="px-5 py-3 text-sm text-slate-500 font-medium">
                    {t('maintenance.records_other', { count: filtered.length })}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-slate-800">
                    €{totalCost.toLocaleString()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? t('maintenance.addTitle') : t('maintenance.editTitle')}
          onClose={() => setModal(null)}
          size="lg"
        >
          <ServiceForm
            initial={modal.record ? {
              carId: modal.record.carId,
              date: modal.record.date,
              serviceType: modal.record.serviceType,
              odometer: modal.record.odometer,
              nextServiceOdometer: modal.record.nextServiceOdometer,
              nextServiceDate: modal.record.nextServiceDate,
              cost: modal.record.cost,
              provider: modal.record.provider,
              technician: modal.record.technician,
              partsReplaced: modal.record.partsReplaced,
              notes: modal.record.notes,
            } : EMPTY_FORM}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title={t('maintenance.deleteTitle')} onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-slate-600 mb-4">{t('maintenance.deleteConfirm')}</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">{t('common.cancel')}</button>
            <button
              onClick={() => { deleteServiceRecord(confirmDelete); setConfirmDelete(null); }}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              {t('common.delete')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
