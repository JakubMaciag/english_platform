import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { progressService, exerciseService } from '../services/supabase'

const STATUS_STYLE = {
  completed: 'bg-green-100 text-green-700',
  skipped:   'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  not_started: 'bg-gray-100 text-gray-500',
}

function ProgressBar({ value, color = 'bg-primary-600' }) {
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  )
}

export default function Progress() {
  const { user } = useAuthStore()
  const [progress, setProgress] = useState([])
  const [allExercises, setAllExercises] = useState([])
  const [filter, setFilter] = useState({ status: 'all', level: 'all', category: 'all' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      progressService.getUserProgress(user.id),
      exerciseService.list(),
    ]).then(([prog, exs]) => {
      setProgress(prog)
      setAllExercises(exs)
    }).finally(() => setLoading(false))
  }, [user])

  // Stats per level
  const levels = ['B2', 'C1', 'C2']
  const statsByLevel = levels.map((lvl) => {
    const exsInLevel = allExercises.filter((e) => e.level === lvl)
    const done = progress.filter((p) => p.exercises?.level === lvl && p.status === 'completed').length
    return { lvl, total: exsInLevel.length, done }
  })

  const statsByCategory = ['grammar', 'vocabulary'].map((cat) => {
    const exsInCat = allExercises.filter((e) => e.category === cat)
    const done = progress.filter((p) => p.exercises?.category === cat && p.status === 'completed').length
    return { cat, total: exsInCat.length, done }
  })

  const filtered = progress.filter((p) => {
    const s = filter.status === 'all' || p.status === filter.status
    const l = filter.level === 'all' || p.exercises?.level === filter.level
    const c = filter.category === 'all' || p.exercises?.category === filter.category
    return s && l && c
  })

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Progress</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* By level */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">By level</h2>
          <div className="space-y-4">
            {statsByLevel.map(({ lvl, total, done }) => (
              <div key={lvl}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{lvl}</span>
                  <span className="text-gray-400">{done}/{total}</span>
                </div>
                <ProgressBar
                  value={total > 0 ? (done / total) * 100 : 0}
                  color={lvl === 'B2' ? 'bg-green-500' : lvl === 'C1' ? 'bg-blue-500' : 'bg-purple-500'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* By category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">By category</h2>
          <div className="space-y-4">
            {statsByCategory.map(({ cat, total, done }) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 capitalize">{cat}</span>
                  <span className="text-gray-400">{done}/{total}</span>
                </div>
                <ProgressBar
                  value={total > 0 ? (done / total) * 100 : 0}
                  color={cat === 'grammar' ? 'bg-indigo-500' : 'bg-orange-500'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'status', options: ['all', 'completed', 'skipped', 'in_progress'] },
          { key: 'level',  options: ['all', 'B2', 'C1', 'C2'] },
          { key: 'category', options: ['all', 'grammar', 'vocabulary'] },
        ].map(({ key, options }) => (
          <select
            key={key}
            value={filter[key]}
            onChange={(e) => setFilter((f) => ({ ...f, [key]: e.target.value }))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {options.map((o) => (
              <option key={o} value={o}>{key === 'status' && o === 'all' ? 'All statuses' : key === 'level' && o === 'all' ? 'All levels' : key === 'category' && o === 'all' ? 'All categories' : o}</option>
            ))}
          </select>
        ))}
        <span className="text-sm text-gray-400 self-center">{filtered.length} entries</span>
      </div>

      {/* History table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No entries match the selected filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((p) => {
              const date = p.last_attempt_at
                ? new Date(p.last_attempt_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'
              return (
                <Link
                  key={p.id}
                  to={`/exercises/${p.exercise_id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p.exercises?.title ?? `Exercise #${p.exercise_id}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.exercises?.category} · {p.exercises?.level}
                      {p.score != null ? ` · Score: ${p.score}%` : ''}
                      {p.attempts > 0 ? ` · ${p.attempts} attempt${p.attempts > 1 ? 's' : ''}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400">{date}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
