import { useAppContext } from '../context/AppContext';
import { Car, CalendarDays, Users, Truck, TrendingUp } from 'lucide-react';
import { format, isToday, parseISO, isAfter, startOfDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { BOOKING_STATUS_COLORS, CAR_STATUS_COLORS } from '../constants';

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
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Available Cars" value={availableCars} icon={Car} color="bg-green-500" sub={`${rentedCars} rented, ${maintenanceCars} in maintenance`} />
        <StatCard label="Active Rentals" value={activeBookings} icon={CalendarDays} color="bg-blue-500" sub={`${confirmedBookings} confirmed`} />
        <StatCard label="Today's Transport" value={todayTransports.length} icon={Truck} color="bg-orange-500" sub={`${carsLeavingToday.length} deliveries, ${carsReturningToday.length} returns`} />
        <StatCard label="Total Customers" value={customers.length} icon={Users} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's transport */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              Today's Transport Tasks
            </h2>
            <Link to="/transport" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {todayTransports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <TrendingUp className="w-8 h-8 mb-2" />
              <p className="text-sm">No transport tasks today</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {todayTransports.map(t => {
                const booking = getBookingForTransport(t.bookingId);
                const carLabel = booking ? getCarLabel(booking.carId) : '—';
                const customerName = booking ? getCustomerName(booking.customerId) : '—';
                return (
                  <li key={t.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{carLabel}</p>
                        <p className="text-xs text-slate-500">{customerName} &mdash; {t.address}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {t.type === 'delivery' ? 'Delivery' : 'Return Pickup'}
                        </span>
                        <span className="text-xs text-slate-400">{format(parseISO(t.scheduledDateTime), 'HH:mm')}</span>
                      </div>
                    </div>
                    {t.driverName && <p className="text-xs text-slate-400 mt-1">Driver: {t.driverName}</p>}
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
              Upcoming Transport
            </h2>
            <Link to="/transport" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {upcomingTransports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <CalendarDays className="w-8 h-8 mb-2" />
              <p className="text-sm">No upcoming transports</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcomingTransports.map(t => {
                const booking = getBookingForTransport(t.bookingId);
                const carLabel = booking ? getCarLabel(booking.carId) : '—';
                return (
                  <li key={t.id} className="px-5 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{carLabel}</p>
                      <p className="text-xs text-slate-500 truncate">{t.address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-slate-700">{format(parseISO(t.scheduledDateTime), 'MMM d')}</p>
                      <p className="text-xs text-slate-400">{format(parseISO(t.scheduledDateTime), 'HH:mm')}</p>
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
            <h2 className="font-semibold text-slate-800">Recent Bookings</h2>
            <Link to="/bookings" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Car</th>
                  <th className="text-left px-5 py-3 font-medium">Period</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{getCustomerName(b.customerId)}</td>
                    <td className="px-5 py-3 text-slate-600">{getCarLabel(b.carId)}</td>
                    <td className="px-5 py-3 text-slate-500">{format(parseISO(b.startDate), 'MMM d')} &ndash; {format(parseISO(b.endDate), 'MMM d, yyyy')}</td>
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
              Fleet Overview
            </h2>
            <Link to="/fleet" className="text-xs text-blue-600 hover:underline">Manage fleet</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium">Vehicle</th>
                  <th className="text-left px-5 py-3 font-medium">Plate</th>
                  <th className="text-left px-5 py-3 font-medium">Category</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Daily Rate</th>
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
