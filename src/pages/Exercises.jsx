import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { exerciseService, progressService } from '../services/supabase'

const LEVEL_COLOR = { B2: 'bg-green-100 text-green-700', C1: 'bg-blue-100 text-blue-700', C2: 'bg-purple-100 text-purple-700' }
const STATUS_COLOR = {
  completed:   'bg-green-100 text-green-700',
  skipped:     'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  not_started: 'bg-gray-100 text-gray-500',
}
const TYPE_ICON = { multiple_choice: '🔘', fill_blank: '✏️', matching: '🔗', translation: '🌐' }

export default function Exercises() {
  const { user, profile } = useAuthStore()
  const [exercises, setExercises] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState(profile?.level ?? 'all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      exerciseService.list({ category: 'all', level: 'all' }),
      progressService.getUserProgress(user.id),
    ]).then(([exs, prog]) => {
      setExercises(exs)
      const map = {}
      prog.forEach((p) => { map[p.exercise_id] = p })
      setProgressMap(map)
    }).finally(() => setLoading(false))
  }, [user])

  const filtered = exercises.filter((e) => {
    const c = category === 'all' || e.category === category
    const l = level === 'all' || e.level === level
    return c && l
  })

  const completedCount = filtered.filter((e) => progressMap[e.id]?.status === 'completed').length
  const skippedCount   = filtered.filter((e) => progressMap[e.id]?.status === 'skipped').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
        <div className="text-sm text-gray-400">
          {completedCount} completed · {skippedCount} skipped · {filtered.length - completedCount - skippedCount} remaining
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'grammar', 'vocabulary'].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
              category === c ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {c === 'all' ? 'All categories' : c}
          </button>
        ))}
        <div className="border-l border-gray-200 mx-1" />
        {['all', 'B2', 'C1', 'C2'].map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              level === l ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {l === 'all' ? 'All levels' : l}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>No exercises match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ex) => {
            const prog = progressMap[ex.id]
            const status = prog?.status ?? 'not_started'
            return (
              <Link
                key={ex.id}
                to={`/exercises/${ex.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TYPE_ICON[ex.exercise_type]}</span>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary-700">{ex.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[ex.level]}`}>{ex.level}</span>
                        <span className="text-xs text-gray-400 capitalize">{ex.category}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400 capitalize">{ex.exercise_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {prog?.score != null && (
                      <span className="text-xs text-gray-400">{prog.score}%</span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[status]}`}>
                      {status.replace('_', ' ')}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                {ex.description && (
                  <p className="text-sm text-gray-400 mt-2 ml-11">{ex.description}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
