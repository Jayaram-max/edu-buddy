import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'

const menuItems = [
  { path: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
  { path: '/admin/users', icon: 'group', label: 'Users' },
  { path: '/admin/quizzes', icon: 'quiz', label: 'Quizzes' },
  { path: '/admin/subjects', icon: 'school', label: 'Subjects' },
  { path: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
  { path: '/admin/content', icon: 'article', label: 'Content' },
  { path: '/admin/settings', icon: 'settings', label: 'Settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { user } = useUser()

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-background-dark flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        className={`fixed lg:relative z-40 h-screen w-64 bg-surface-dark border-r border-border-dark flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border-dark">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined font-bold">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-white font-bold">Edu Buddy AI</h1>
              <p className="text-xs text-text-secondary">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path, item.exact)
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border-dark">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
            <div 
              className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-primary/20"
              style={{ backgroundImage: `url("${user?.imageUrl}")` }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-text-secondary text-xs truncate">Administrator</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 mt-2 text-text-secondary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-sm">Back to App</span>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background-dark/80 backdrop-blur-md border-b border-border-dark px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">search</span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-surface-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}