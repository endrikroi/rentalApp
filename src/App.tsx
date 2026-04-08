import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Fleet from './pages/Fleet';
import TransportPage from './pages/Transport';
import Customers from './pages/Customers';
import Maintenance from './pages/Maintenance';
import Financials from './pages/Financials';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="transport" element={<TransportPage />} />
            <Route path="customers" element={<Customers />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="financials" element={<Financials />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
