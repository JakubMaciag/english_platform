import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { profileService, exerciseService, dictionaryService, progressService } from '../../services/supabase'

function StatCard({ label, value, to, color = 'text-primary-700' }) {
  return (
    <Link to={to} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all block">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-primary-500 mt-2">Manage →</p>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, exercises: 0, dictEntries: 0, completions: 0 })
  const [recentProgress, setRecentProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      profileService.getAllProfiles(),
      exerciseService.list(),
      dictionaryService.search({ pageSize: 1 }),
      progressService.getAllProgress(),
    ]).then(([users, exs, { count }, prog]) => {
      setStats({
        users: users.length,
        exercises: exs.length,
        dictEntries: count,
        completions: prog.filter((p) => p.status === 'completed').length,
      })
      setRecentProgress(prog.slice(0, 10))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          Admin Panel
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Users" value={stats.users} to="/admin/users" color="text-primary-700" />
          <StatCard label="Exercises" value={stats.exercises} to="/admin/exercises" color="text-indigo-700" />
          <StatCard label="Dictionary entries" value={stats.dictEntries} to="/admin/dictionary" color="text-teal-700" />
          <StatCard label="Completions" value={stats.completions} to="/admin/users" color="text-green-700" />
        </div>
      )}

      {/* Recent user activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent user activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {recentProgress.length === 0 ? (
            <p className="py-12 text-center text-gray-400 text-sm">No activity yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentProgress.map((p) => {
                const date = p.last_attempt_at
                  ? new Date(p.last_attempt_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : '—'
                return (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {p.profiles?.username ?? 'Unknown'}
                        <span className="text-gray-400 font-normal"> · </span>
                        {p.exercises?.title ?? `Exercise #${p.exercise_id}`}
                      </p>
                      <p className="text-xs text-gray-400">{date}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.status === 'completed' ? 'bg-green-100 text-green-700' :
                      p.status === 'skipped'   ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                    }`}>{p.status}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
