import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, Handshake, Activity } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Companies from './pages/Companies'
import Deals from './pages/Deals'
import Activities from './pages/Activities'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacten' },
  { to: '/companies', icon: Building2, label: 'Bedrijven' },
  { to: '/deals', icon: Handshake, label: 'Deals' },
  { to: '/activities', icon: Activity, label: 'Activiteiten' },
]

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>📊 MijnCRM</h1>
            <p>Klantrelatiebeheer</p>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'}>
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/activities" element={<Activities />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
