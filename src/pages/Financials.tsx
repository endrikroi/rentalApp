import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  TrendingUp, TrendingDown, DollarSign, Download,
  Calendar, ChevronDown,
} from 'lucide-react';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function getCurrentYearRange(): number[] {
  const current = new Date().getFullYear();
  return [current - 2, current - 1, current, current + 1];
}

export default function Financials() {
  const { bookings, serviceRecords, cars, customers } = useAppContext();
  const { t } = useTranslation();

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState<number | 'all'>(getMonth(now));
  const [filterYear, setFilterYear] = useState<number>(getYear(now));

  // ── Helpers ────────────────────────────────────────────────────────────────
  function inPeriod(dateStr: string) {
    const d = parseISO(dateStr);
    if (filterMonth === 'all') return getYear(d) === filterYear;
    return getYear(d) === filterYear && getMonth(d) === filterMonth;
  }

  function carLabel(carId: string) {
    const c = cars.find(x => x.id === carId);
    return c ? `${c.year} ${c.make} ${c.model} – ${c.plate}` : carId;
  }

  function customerLabel(customerId: string) {
    const c = customers.find(x => x.id === customerId);
    return c ? `${c.firstName} ${c.lastName}` : customerId;
  }

  // ── Income rows (from bookings, use createdAt for period bucketing) ────────
  const incomeRows = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'cancelled' && inPeriod(b.createdAt))
      .map(b => ({
        id: b.id,
        date: b.createdAt,
        customer: customerLabel(b.customerId),
        car: carLabel(b.carId),
        period: `${b.startDate} → ${b.endDate}`,
        status: b.status,
        dailyRate: b.dailyRate,
        amount: b.totalPrice,
      }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, cars, customers, filterMonth, filterYear]);

  // ── Cost rows (from maintenance service records) ───────────────────────────
  const costRows = useMemo(() => {
    return serviceRecords
      .filter(r => inPeriod(r.date))
      .map(r => ({
        id: r.id,
        date: r.date,
        car: carLabel(r.carId),
        serviceType: r.serviceType,
        provider: r.provider,
        amount: r.cost,
      }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceRecords, cars, filterMonth, filterYear]);

  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalCosts = costRows.reduce((s, r) => s + r.amount, 0);
  const netProfit = totalIncome - totalCosts;

  // ── Excel export ────────────────────────────────────────────────────────────
  function handleExport() {
    const wb = XLSX.utils.book_new();

    // Income sheet
    const incomeData = [
      [t('financials.export.incomeSheet')],
      [
        t('financials.table.date'),
        t('financials.table.customer'),
        t('financials.table.car'),
        t('financials.table.period'),
        t('financials.table.status'),
        t('financials.table.dailyRate'),
        t('financials.table.amount'),
      ],
      ...incomeRows.map(r => [
        format(parseISO(r.date), 'dd/MM/yyyy'),
        r.customer,
        r.car,
        r.period,
        r.status,
        r.dailyRate,
        r.amount,
      ]),
      [],
      ['', '', '', '', '', t('financials.summary.totalIncome'), totalIncome],
    ];
    const wsIncome = XLSX.utils.aoa_to_sheet(incomeData);
    XLSX.utils.book_append_sheet(wb, wsIncome, t('financials.export.incomeSheet'));

    // Costs sheet
    const costsData = [
      [t('financials.export.costsSheet')],
      [
        t('financials.table.date'),
        t('financials.table.car'),
        t('financials.table.serviceType'),
        t('financials.table.provider'),
        t('financials.table.amount'),
      ],
      ...costRows.map(r => [
        format(parseISO(r.date), 'dd/MM/yyyy'),
        r.car,
        r.serviceType,
        r.provider,
        r.amount,
      ]),
      [],
      ['', '', '', t('financials.summary.totalCosts'), totalCosts],
    ];
    const wsCosts = XLSX.utils.aoa_to_sheet(costsData);
    XLSX.utils.book_append_sheet(wb, wsCosts, t('financials.export.costsSheet'));

    // Summary sheet
    const summaryData = [
      [t('financials.export.summarySheet')],
      [],
      [t('financials.summary.totalIncome'), totalIncome],
      [t('financials.summary.totalCosts'), totalCosts],
      [t('financials.summary.netProfit'), netProfit],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, t('financials.export.summarySheet'));

    const periodLabel =
      filterMonth === 'all'
        ? String(filterYear)
        : `${filterYear}-${String((filterMonth as number) + 1).padStart(2, '0')}`;
    XLSX.writeFile(wb, `financials-${periodLabel}.xlsx`);
  }

  // ── Period label for display ────────────────────────────────────────────────
  const periodDisplay =
    filterMonth === 'all'
      ? String(filterYear)
      : format(new Date(filterYear, filterMonth as number, 1), 'MMMM yyyy');

  const years = getCurrentYearRange();

  const BOOKING_STATUS_BADGE: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('financials.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('financials.subtitle', { period: periodDisplay })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Month filter */}
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterMonth === 'all' ? 'all' : filterMonth}
              onChange={e =>
                setFilterMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="pl-8 pr-7 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">{t('financials.filter.allMonths')}</option>
              {MONTHS.map(m => (
                <option key={m} value={m}>
                  {format(new Date(2000, m, 1), 'MMMM')}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Year filter */}
          <div className="relative">
            <select
              value={filterYear}
              onChange={e => setFilterYear(Number(e.target.value))}
              className="px-3 pr-7 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('financials.exportExcel')}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">{t('financials.summary.totalIncome')}</span>
            <div className="bg-green-100 rounded-lg p-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">${totalIncome.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">
            {t('financials.summary.bookingsCount', { count: incomeRows.length })}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">{t('financials.summary.totalCosts')}</span>
            <div className="bg-red-100 rounded-lg p-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">${totalCosts.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">
            {t('financials.summary.servicesCount', { count: costRows.length })}
          </p>
        </div>

        <div className={`rounded-xl border p-5 ${netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {t('financials.summary.netProfit')}
            </span>
            <div className={`rounded-lg p-2 ${netProfit >= 0 ? 'bg-green-200' : 'bg-red-200'}`}>
              <DollarSign className={`w-4 h-4 ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-800' : 'text-red-700'}`}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
          </p>
          <p className={`text-xs mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {netProfit >= 0 ? t('financials.summary.profit') : t('financials.summary.loss')}
          </p>
        </div>
      </div>

      {/* Income table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <h2 className="text-base font-semibold text-slate-800">{t('financials.income.title')}</h2>
          <span className="ml-auto text-sm text-slate-500">
            {t('financials.income.rows', { count: incomeRows.length })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">{t('financials.table.date')}</th>
                <th className="px-4 py-3">{t('financials.table.customer')}</th>
                <th className="px-4 py-3">{t('financials.table.car')}</th>
                <th className="px-4 py-3">{t('financials.table.period')}</th>
                <th className="px-4 py-3">{t('financials.table.status')}</th>
                <th className="px-4 py-3 text-right">{t('financials.table.dailyRate')}</th>
                <th className="px-4 py-3 text-right">{t('financials.table.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incomeRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    {t('financials.income.noData')}
                  </td>
                </tr>
              ) : (
                incomeRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">
                      {format(parseISO(row.date), 'd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.car}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{row.period}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_BADGE[row.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">${row.dailyRate}/day</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      ${row.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {incomeRows.length > 0 && (
              <tfoot>
                <tr className="bg-green-50 border-t border-green-100">
                  <td colSpan={6} className="px-4 py-3 font-semibold text-slate-700 text-right">
                    {t('financials.summary.totalIncome')}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">
                    ${totalIncome.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Costs table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <h2 className="text-base font-semibold text-slate-800">{t('financials.costs.title')}</h2>
          <span className="ml-auto text-sm text-slate-500">
            {t('financials.costs.rows', { count: costRows.length })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">{t('financials.table.date')}</th>
                <th className="px-4 py-3">{t('financials.table.car')}</th>
                <th className="px-4 py-3">{t('financials.table.serviceType')}</th>
                <th className="px-4 py-3">{t('financials.table.provider')}</th>
                <th className="px-4 py-3 text-right">{t('financials.table.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {costRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    {t('financials.costs.noData')}
                  </td>
                </tr>
              ) : (
                costRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">
                      {format(parseISO(row.date), 'd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.car}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">
                      {row.serviceType.replace(/-/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.provider}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      ${row.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {costRows.length > 0 && (
              <tfoot>
                <tr className="bg-red-50 border-t border-red-100">
                  <td colSpan={4} className="px-4 py-3 font-semibold text-slate-700 text-right">
                    {t('financials.summary.totalCosts')}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    ${totalCosts.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
