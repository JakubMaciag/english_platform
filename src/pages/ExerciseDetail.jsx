import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { exerciseService, progressService } from '../services/supabase'

// ---- Exercise type renderers ----

function MultipleChoice({ data, onSubmit, submitted, correct }) {
  const [selected, setSelected] = useState(null)

  function handleSubmit() {
    if (selected === null) return
    onSubmit(selected === data.correct_index, selected)
  }

  return (
    <div className="space-y-4">
      {data.context && (
        <p className="text-lg text-gray-800 font-medium bg-gray-50 rounded-lg p-4 leading-relaxed">
          {data.context}
        </p>
      )}
      <p className="text-gray-700">{data.question}</p>
      <div className="grid gap-2">
        {data.options.map((opt, i) => {
          let cls = 'px-4 py-3 rounded-lg border-2 text-left text-sm transition-all '
          if (!submitted) {
            cls += selected === i ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 hover:border-gray-300 text-gray-700'
          } else {
            if (i === data.correct_index) cls += 'border-green-500 bg-green-50 text-green-800'
            else if (i === selected && !correct) cls += 'border-red-400 bg-red-50 text-red-700'
            else cls += 'border-gray-100 text-gray-400'
          }
          return (
            <button key={i} disabled={submitted} onClick={() => setSelected(i)} className={cls}>
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
            </button>
          )
        })}
      </div>
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          Submit answer
        </button>
      )}
    </div>
  )
}

function FillBlank({ data, onSubmit, submitted, correct }) {
  const [answer, setAnswer] = useState('')

  const parts = data.sentence.split(/___+/)

  function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim()) return
    const userAns = answer.trim().toLowerCase()
    const isCorrect = data.correct_answers.some((a) => a.toLowerCase() === userAns)
    onSubmit(isCorrect, answer.trim())
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-700">{data.question}</p>
      <div className="text-lg text-gray-800 bg-gray-50 rounded-lg p-4 leading-relaxed">
        {parts[0]}
        {submitted ? (
          <span className={`font-bold px-2 py-0.5 rounded mx-1 ${correct ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
            {answer}
          </span>
        ) : (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="your answer"
            className="inline-block w-40 border-b-2 border-primary-400 bg-transparent text-center focus:outline-none text-primary-700 font-semibold mx-1"
          />
        )}
        {parts[1]}
      </div>
      {data.hint && !submitted && (
        <p className="text-xs text-gray-400 italic">Hint: {data.hint}</p>
      )}
      {!submitted && (
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={!answer.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Submit answer
          </button>
        </form>
      )}
    </div>
  )
}

function Matching({ data, onSubmit, submitted }) {
  const [matches, setMatches] = useState({}) // left → right
  const [selected, setSelected] = useState(null) // currently selected left item

  const rights = data.pairs.map((p) => p.right)
  const correctMap = Object.fromEntries(data.pairs.map((p) => [p.left, p.right]))
  const usedRights = new Set(Object.values(matches))

  function handleLeft(left) {
    if (submitted) return
    setSelected((s) => (s === left ? null : left))
  }

  function handleRight(right) {
    if (!selected || submitted) return
    setMatches((m) => ({ ...m, [selected]: right }))
    setSelected(null)
  }

  function handleSubmit() {
    const correct = data.pairs.every((p) => matches[p.left] === p.right)
    const score = Math.round(
      (data.pairs.filter((p) => matches[p.left] === p.right).length / data.pairs.length) * 100
    )
    onSubmit(correct, matches, score)
  }

  const allMatched = Object.keys(matches).length === data.pairs.length

  return (
    <div className="space-y-4">
      <p className="text-gray-700">{data.instruction}</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          {data.pairs.map((p) => {
            let cls = 'px-3 py-2.5 rounded-lg border-2 text-sm cursor-pointer transition-all font-medium '
            if (submitted) {
              cls += matches[p.left] === correctMap[p.left] ? 'border-green-400 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-700'
            } else if (selected === p.left) {
              cls += 'border-primary-500 bg-primary-50 text-primary-800'
            } else if (matches[p.left]) {
              cls += 'border-gray-300 bg-gray-50 text-gray-600'
            } else {
              cls += 'border-gray-200 hover:border-primary-300 text-gray-700'
            }
            return (
              <button key={p.left} onClick={() => handleLeft(p.left)} className={cls + ' w-full text-left'}>
                {p.left}
                {matches[p.left] && !submitted && (
                  <span className="text-xs text-gray-400 ml-2">→ {matches[p.left]}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {rights.map((r) => {
            const used = usedRights.has(r)
            let cls = 'px-3 py-2.5 rounded-lg border-2 text-sm transition-all '
            if (submitted) {
              cls += 'border-gray-100 text-gray-400 cursor-default'
            } else if (used) {
              cls += 'border-gray-200 bg-gray-50 text-gray-400 cursor-default'
            } else {
              cls += selected
                ? 'border-primary-300 hover:border-primary-500 hover:bg-primary-50 cursor-pointer text-gray-700'
                : 'border-gray-200 text-gray-500 cursor-default'
            }
            return (
              <button key={r} onClick={() => handleRight(r)} disabled={used || submitted} className={cls + ' w-full text-left'}>
                {r}
              </button>
            )
          })}
        </div>
      </div>
      {submitted && (
        <div className="space-y-1 pt-2">
          {data.pairs.map((p) => (
            <p key={p.left} className="text-sm">
              <span className="font-medium">{p.left}</span>
              <span className="text-gray-400"> → </span>
              <span className={matches[p.left] === p.right ? 'text-green-700' : 'text-red-600'}>
                {matches[p.left] ?? '(no answer)'}
              </span>
              {matches[p.left] !== p.right && (
                <span className="text-gray-400 ml-1">(correct: {p.right})</span>
              )}
            </p>
          ))}
        </div>
      )}
      {!submitted && (
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allMatched}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Submit matches
          </button>
          {Object.keys(matches).length > 0 && (
            <button
              onClick={() => setMatches({})}
              className="text-sm text-gray-400 hover:text-gray-600 px-3"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Translation({ data, onSubmit, submitted, correct }) {
  const [answer, setAnswer] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim()) return
    const userAns = answer.trim().toLowerCase().replace(/[.,!?]$/, '')
    const allCorrect = [
      ...data.correct_answers,
      ...(data.accepted_variants ?? []),
    ]
    const isCorrect = allCorrect.some(
      (a) => a.toLowerCase().replace(/[.,!?]$/, '') === userAns
    )
    onSubmit(isCorrect, answer.trim())
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-700">{data.instruction}</p>
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-400 mb-1">{data.source_language}</p>
        <p className="text-lg font-medium text-gray-800">{data.source_text}</p>
      </div>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            placeholder={`Type your ${data.target_language} translation…`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <button
            type="submit"
            disabled={!answer.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Submit translation
          </button>
        </form>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-1">Your answer:</p>
          <p className={`font-medium ${correct ? 'text-green-700' : 'text-red-700'}`}>{answer}</p>
          {!correct && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-1">Accepted answers:</p>
              <ul className="space-y-1">
                {data.correct_answers.map((a, i) => (
                  <li key={i} className="text-sm text-green-700 font-medium">• {a}</li>
                ))}
                {data.accepted_variants?.map((a, i) => (
                  <li key={i} className="text-sm text-gray-500">• {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Main page ----

export default function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [exercise, setExercise] = useState(null)
  const [progress, setProgress] = useState(null)
  const [allIds, setAllIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setSubmitted(false)
    setCorrect(false)
    setScore(null)
    try {
      const [ex, exs, prog] = await Promise.all([
        exerciseService.getById(Number(id)),
        exerciseService.list(),
        progressService.getForExercise(user.id, Number(id)),
      ])
      setExercise(ex)
      setAllIds(exs.map((e) => e.id))
      setProgress(prog)
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => { load() }, [load])

  const currentIndex = allIds.indexOf(Number(id))
  const prevId = allIds[currentIndex - 1]
  const nextId = allIds[currentIndex + 1]

  async function saveProgress(isCorrect, attemptScore = null) {
    setSaving(true)
    try {
      const attempts = (progress?.attempts ?? 0) + 1
      const finalScore = attemptScore ?? (isCorrect ? 100 : 0)
      const updates = {
        status: isCorrect ? 'completed' : 'in_progress',
        score: isCorrect ? finalScore : (progress?.score ?? null),
        attempts,
        ...(isCorrect ? { completed_at: new Date().toISOString() } : {}),
      }
      const updated = await progressService.upsert(user.id, Number(id), updates)
      setProgress(updated)
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(isCorrect, _answer, attemptScore) {
    setCorrect(isCorrect)
    setSubmitted(true)
    setScore(attemptScore ?? (isCorrect ? 100 : 0))
    await saveProgress(isCorrect, attemptScore)
  }

  async function handleSkip() {
    setSaving(true)
    try {
      const updated = await progressService.upsert(user.id, Number(id), {
        status: 'skipped',
        attempts: (progress?.attempts ?? 0),
      })
      setProgress(updated)
      if (nextId) navigate(`/exercises/${nextId}`)
      else navigate('/exercises')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Exercise not found.</p>
        <Link to="/exercises" className="text-primary-600 hover:underline mt-2 inline-block">Back to exercises</Link>
      </div>
    )
  }

  const alreadyCompleted = progress?.status === 'completed'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/exercises" className="hover:text-primary-600">Exercises</Link>
        <span>/</span>
        <span className="text-gray-700">{exercise.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{exercise.title}</h1>
            {exercise.description && (
              <p className="text-sm text-gray-500 mt-1">{exercise.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              { B2: 'bg-green-100 text-green-700', C1: 'bg-blue-100 text-blue-700', C2: 'bg-purple-100 text-purple-700' }[exercise.level]
            }`}>{exercise.level}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
              {exercise.category}
            </span>
          </div>
        </div>

        {/* Already completed banner */}
        {alreadyCompleted && !submitted && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
            <span>✅</span>
            <span>You already completed this exercise (score: {progress.score}%). You can redo it below.</span>
          </div>
        )}

        {/* Exercise renderer */}
        <div>
          {exercise.exercise_type === 'multiple_choice' && (
            <MultipleChoice data={exercise.data} onSubmit={handleSubmit} submitted={submitted} correct={correct} />
          )}
          {exercise.exercise_type === 'fill_blank' && (
            <FillBlank data={exercise.data} onSubmit={handleSubmit} submitted={submitted} correct={correct} />
          )}
          {exercise.exercise_type === 'matching' && (
            <Matching data={exercise.data} onSubmit={handleSubmit} submitted={submitted} />
          )}
          {exercise.exercise_type === 'translation' && (
            <Translation data={exercise.data} onSubmit={handleSubmit} submitted={submitted} correct={correct} />
          )}
        </div>

        {/* Feedback */}
        {submitted && (
          <div className={`mt-6 p-4 rounded-lg border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-semibold text-sm ${correct ? 'text-green-700' : 'text-red-700'}`}>
              {correct ? '✅ Correct!' : '❌ Incorrect'}
              {score != null && ` · Score: ${score}%`}
            </p>
            {exercise.data.explanation && (
              <p className="text-sm text-gray-600 mt-2">{exercise.data.explanation}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => prevId && navigate(`/exercises/${prevId}`)}
          disabled={!prevId}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {!submitted && progress?.status !== 'completed' && (
            <button
              onClick={handleSkip}
              disabled={saving}
              className="px-4 py-2 text-sm text-yellow-600 border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50"
            >
              Skip →
            </button>
          )}
          {submitted && nextId && (
            <button
              onClick={() => navigate(`/exercises/${nextId}`)}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Next exercise →
            </button>
          )}
          {submitted && !nextId && (
            <Link to="/exercises" className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Back to list
            </Link>
          )}
        </div>

        <button
          onClick={() => nextId && navigate(`/exercises/${nextId}`)}
          disabled={!nextId}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Attempt info */}
      {progress && progress.attempts > 0 && (
        <p className="text-center text-xs text-gray-400">
          {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''} ·
          {progress.score != null ? ` Best score: ${progress.score}%` : ''}
        </p>
      )}
    </div>
  )
}
