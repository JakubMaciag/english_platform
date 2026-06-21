import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { progressService, exerciseService } from '../services/supabase'

const LEVEL_COLOR = { B2: 'bg-green-100 text-green-800', C1: 'bg-blue-100 text-blue-800', C2: 'bg-purple-100 text-purple-800' }

function StatCard({ label, value, sub, color = 'text-primary-700' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuthStore()
  const [progress, setProgress] = useState([])
  const [totalExercises, setTotalExercises] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      progressService.getUserProgress(user.id),
      exerciseService.list(),
    ]).then(([prog, exs]) => {
      setProgress(prog)
      setTotalExercises(exs.length)
    }).finally(() => setLoading(false))
  }, [user])

  const completed = progress.filter((p) => p.status === 'completed').length
  const skipped   = progress.filter((p) => p.status === 'skipped').length
  const percent   = totalExercises > 0 ? Math.round((completed / totalExercises) * 100) : 0

  const recent = [...progress]
    .sort((a, b) => new Date(b.last_attempt_at) - new Date(a.last_attempt_at))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, <span className="text-primary-700">{profile?.username}</span>!
          </h1>
          <p className="text-gray-500 mt-1">Keep up the great work.</p>
        </div>
        {profile && (
          <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${LEVEL_COLOR[profile.level]}`}>
            Level {profile.level}
          </span>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Completed" value={completed} sub={`of ${totalExercises} exercises`} color="text-green-600" />
          <StatCard label="Skipped" value={skipped} sub="can return anytime" color="text-yellow-600" />
          <StatCard label="Remaining" value={totalExercises - completed - skipped} color="text-gray-700" />
          <StatCard label="Progress" value={`${percent}%`} sub="of all exercises" />
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Overall progress</span>
          <span>{percent}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-600 inline-block" /> Completed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Skipped</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" /> Remaining</span>
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/dictionary', emoji: '📖', label: 'Dictionary', desc: 'Polish↔English & descriptive' },
            { to: '/exercises',  emoji: '✏️',  label: 'Exercises',  desc: 'Grammar & vocabulary' },
            { to: '/progress',   emoji: '📊',  label: 'Progress',   desc: 'Your full history' },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-2">{c.emoji}</div>
              <div className="font-semibold text-gray-900 group-hover:text-primary-700">{c.label}</div>
              <div className="text-sm text-gray-400 mt-0.5">{c.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent activity</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {recent.map((p) => {
              const date = p.last_attempt_at
                ? new Date(p.last_attempt_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : '—'
              const statusColor = p.status === 'completed' ? 'text-green-600 bg-green-50' : p.status === 'skipped' ? 'text-yellow-600 bg-yellow-50' : 'text-gray-500 bg-gray-100'
              return (
                <Link
                  key={p.id}
                  to={`/exercises/${p.exercise_id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.exercises?.title ?? `Exercise #${p.exercise_id}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.exercises?.category} · {p.exercises?.level} · {date}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                    {p.status}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
