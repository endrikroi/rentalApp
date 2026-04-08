import { NavLink, useLocation } from 'react-router-dom';
import { Car, CalendarDays, Truck, Users, LayoutDashboard, Wrench, BarChart2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const navRoutes = [
  { to: '/', key: 'dashboard', icon: LayoutDashboard },
  { to: '/bookings', key: 'bookings', icon: CalendarDays },
  { to: '/fleet', key: 'fleet', icon: Car },
  { to: '/transport', key: 'transport', icon: Truck },
  { to: '/customers', key: 'customers', icon: Users },
  { to: '/maintenance', key: 'maintenance', icon: Wrench },
  { to: '/financials', key: 'financials', icon: BarChart2 },
] as const;

export default function Sidebar() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isAlbanian = i18n.language === 'sq';

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-lg p-2">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">{t('sidebar.appName')}</h1>
            <p className="text-xs text-slate-400">{t('sidebar.appSubtitle')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navRoutes.map(({ to, key, icon: Icon }) => {
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
              {t(`sidebar.nav.${key}`)}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-700">
        <div className="flex gap-2">
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isAlbanian
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {t('sidebar.langEnglish')}
          </button>
          <button
            onClick={() => i18n.changeLanguage('sq')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAlbanian
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {t('sidebar.langAlbanian')}
          </button>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">v1.0.0 &mdash; {t('sidebar.footer')}</p>
      </div>
    </aside>
  );
}
