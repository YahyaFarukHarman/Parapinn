import { Routes, Route } from 'react-router-dom'

import RootLayout from './layouts/root-layout'
import HomePage from './pages/home'
import ChatPage from './pages/chat'
import DashboardPage from './pages/dashboard'
import ReportsPage from './pages/reports'
import KasaPage from './pages/kasa'
import PortfolioPage from './pages/portfolio'
import SettingsPage from './pages/settings'
import NotFoundPage from './pages/not-found'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="kasa" element={<KasaPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
