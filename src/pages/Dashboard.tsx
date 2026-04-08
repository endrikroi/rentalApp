import { useAppContext } from '../context/AppContext';
import { Car, CalendarDays, Users, Truck, TrendingUp } from 'lucide-react';
import { format, isToday, parseISO, isAfter, startOfDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { BOOKING_STATUS_COLORS, CAR_STATUS_COLORS } from '../constants';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon: Icon, color, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { cars, customers, bookings, transports } = useAppContext();
  const { t } = useTranslation();

  const today = startOfDay(new Date());

  const availableCars = cars.filter(c => c.status === 'available').length;
  const rentedCars = cars.filter(c => c.status === 'rented').length;
  const maintenanceCars = cars.filter(c => c.status === 'maintenance').length;

  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  const pendingTransports = transports.filter(t => t.status === 'pending' || t.status === 'in-progress');

  const todayTransports = pendingTransports.filter(t => isToday(parseISO(t.scheduledDateTime)));
  const upcomingTransports = pendingTransports
    .filter(t => !isToday(parseISO(t.scheduledDateTime)) && isAfter(parseISO(t.scheduledDateTime), today))
    .sort((a, b) => a.scheduledDateTime.localeCompare(b.scheduledDateTime))
    .slice(0, 5);

  const recentBookings = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const getCustomerName = (id: string) => {
    const c = customers.find(cu => cu.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  };

  const getCarLabel = (id: string) => {
    const c = cars.find(car => car.id === id);
    return c ? `${c.make} ${c.model} (${c.plate})` : 'Unknown';
  };

  const getBookingForTransport = (bookingId: string) => bookings.find(b => b.id === bookingId);

  const carsLeavingToday = transports.filter(t =>
    t.type === 'delivery' && isToday(parseISO(t.scheduledDateTime)) && t.status !== 'cancelled'
  );
  const carsReturningToday = transports.filter(t =>
    t.type === 'return-pickup' && isToday(parseISO(t.scheduledDateTime)) && t.status !== 'cancelled'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label={t('dashboard.stats.availableCars')} value={availableCars} icon={Car} color="bg-green-500" sub={t('dashboard.stats.availableCarsSubtitle', { rented: rentedCars, maintenance: maintenanceCars })} />
        <StatCard label={t('dashboard.stats.activeRentals')} value={activeBookings} icon={CalendarDays} color="bg-blue-500" sub={t('dashboard.stats.activeRentalsSubtitle', { confirmed: confirmedBookings })} />
        <StatCard label={t('dashboard.stats.todayTransport')} value={todayTransports.length} icon={Truck} color="bg-orange-500" sub={t('dashboard.stats.todayTransportSubtitle', { deliveries: carsLeavingToday.length, returns: carsReturningToday.length })} />
        <StatCard label={t('dashboard.stats.totalCustomers')} value={customers.length} icon={Users} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's transport */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              {t('dashboard.todaysTasks')}
            </h2>
            <Link to="/transport" className="text-xs text-blue-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          {todayTransports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <TrendingUp className="w-8 h-8 mb-2" />
              <p className="text-sm">{t('dashboard.noTodayTasks')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {todayTransports.map(transport => {
                const booking = getBookingForTransport(transport.bookingId);
                const carLabel = booking ? getCarLabel(booking.carId) : '—';
                const customerName = booking ? getCustomerName(booking.customerId) : '—';
                return (
                  <li key={transport.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{carLabel}</p>
                        <p className="text-xs text-slate-500">{customerName} &mdash; {transport.address}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${transport.type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {transport.type === 'delivery' ? t('dashboard.delivery') : t('dashboard.returnPickup')}
                        </span>
                        <span className="text-xs text-slate-400">{format(parseISO(transport.scheduledDateTime), 'HH:mm')}</span>
                      </div>
                    </div>
                    {transport.driverName && <p className="text-xs text-slate-400 mt-1">{t('common.driver')}: {transport.driverName}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Upcoming transports */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              {t('dashboard.upcomingTransport')}
            </h2>
            <Link to="/transport" className="text-xs text-blue-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          {upcomingTransports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <CalendarDays className="w-8 h-8 mb-2" />
              <p className="text-sm">{t('dashboard.noUpcomingTransport')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcomingTransports.map(transport => {
                const booking = getBookingForTransport(transport.bookingId);
                const carLabel = booking ? getCarLabel(booking.carId) : '—';
                return (
                  <li key={transport.id} className="px-5 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{carLabel}</p>
                      <p className="text-xs text-slate-500 truncate">{transport.address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-slate-700">{format(parseISO(transport.scheduledDateTime), 'd MMM')}</p>
                      <p className="text-xs text-slate-400">{format(parseISO(transport.scheduledDateTime), 'HH:mm')}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">{t('dashboard.recentBookings')}</h2>
            <Link to="/bookings" className="text-xs text-blue-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard.customer')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard.car')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard.period')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard.status')}</th>
                  <th className="text-right px-5 py-3 font-medium">{t('dashboard.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{getCustomerName(b.customerId)}</td>
                    <td className="px-5 py-3 text-slate-600">{getCarLabel(b.carId)}</td>
                    <td className="px-5 py-3 text-slate-500">{format(parseISO(b.startDate), 'd MMM')} &ndash; {format(parseISO(b.endDate), 'd MMM yyyy')}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${BOOKING_STATUS_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-800">${b.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-600" />
              {t('dashboard.fleetOverview')}
            </h2>
            <Link to="/fleet" className="text-xs text-blue-600 hover:underline">{t('dashboard.manageFleet')}</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard.vehicle')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard.plate')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard.category')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard.status')}</th>
                  <th className="text-right px-5 py-3 font-medium">{t('dashboard.dailyRate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cars.map(car => (
                  <tr key={car.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{car.year} {car.make} {car.model}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{car.plate}</td>
                    <td className="px-5 py-3 text-slate-600 capitalize">{car.category}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CAR_STATUS_COLORS[car.status]}`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-800">${car.dailyRate}/day</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
