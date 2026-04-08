import { NavLink, useLocation } from 'react-router-dom';
import { Car, CalendarDays, Truck, Users, LayoutDashboard, Wrench } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/fleet', label: 'Fleet', icon: Car },
  { to: '/transport', label: 'Transport', icon: Truck },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-lg p-2">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">CarFleet</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">v1.0.0 &mdash; Internal use only</p>
      </div>
    </aside>
  );
}
