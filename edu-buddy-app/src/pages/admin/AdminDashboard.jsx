import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '2,847', icon: 'group', change: '+12%', color: 'primary' },
    { label: 'Active Sessions', value: '156', icon: 'play_circle', change: '+8%', color: 'blue-400' },
    { label: 'Quizzes Taken', value: '12,459', icon: 'quiz', change: '+23%', color: 'purple-400' },
    { label: 'Avg. Score', value: '78%', icon: 'trending_up', change: '+5%', color: 'orange-400' },
  ]

  const recentUsers = [
    { name: 'John Doe', email: 'john@example.com', joined: '2 hours ago', status: 'active' },
    { name: 'Jane Smith', email: 'jane@example.com', joined: '5 hours ago', status: 'active' },
    { name: 'Mike Johnson', email: 'mike@example.com', joined: '1 day ago', status: 'inactive' },
    { name: 'Sarah Wilson', email: 'sarah@example.com', joined: '2 days ago', status: 'active' },
  ]

  const recentActivity = [
    { action: 'New user registered', user: 'John Doe', time: '2 min ago', icon: 'person_add' },
    { action: 'Quiz completed', user: 'Jane Smith', time: '15 min ago', icon: 'quiz' },
    { action: 'Content updated', user: 'Admin', time: '1 hour ago', icon: 'edit' },
    { action: 'New subject added', user: 'Admin', time: '3 hours ago', icon: 'add_circle' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-text-secondary">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface-dark border border-border-dark rounded-xl text-white hover:bg-border-dark transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-background-dark rounded-xl font-bold transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Add User
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-${stat.color}`}>{stat.icon}</span>
              </div>
              <span className="text-primary text-sm font-bold bg-primary/10 px-2 py-1 rounded-md">
                {stat.change}
              </span>
            </div>
            <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">User Activity</h3>
            <select className="bg-input-dark border border-border-dark rounded-lg px-3 py-1 text-sm text-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 45, 80, 55, 95, 70, 85].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                  className="w-full bg-primary/60 hover:bg-primary rounded-t-lg transition-colors cursor-pointer"
                />
                <span className="text-xs text-text-secondary mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface-dark border border-border-dark rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{activity.action}</p>
                  <p className="text-text-secondary text-xs">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-surface-dark border border-border-dark rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Users</h3>
          <Link to="/admin/users" className="text-primary text-sm hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-dark">
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">User</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Email</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Joined</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user, i) => (
                <tr key={i} className="border-b border-border-dark/50 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{user.email}</td>
                  <td className="py-3 px-4 text-text-secondary">{user.joined}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}