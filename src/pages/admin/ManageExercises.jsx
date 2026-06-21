import { useEffect, useState } from 'react'
import { exerciseService } from '../../services/supabase'

const EMPTY = {
  title: '', description: '', category: 'grammar', level: 'B2',
  exercise_type: 'multiple_choice', order_index: 0,
  data: JSON.stringify({
    question: '',
    context: '',
    options: ['', '', '', ''],
    correct_index: 0,
    explanation: '',
  }, null, 2),
}

const CATEGORIES = ['grammar', 'vocabulary']
const LEVELS     = ['B2', 'C1', 'C2']
const TYPES      = ['multiple_choice', 'fill_blank', 'matching', 'translation']

const LEVEL_COLOR = { B2: 'bg-green-100 text-green-700', C1: 'bg-blue-100 text-blue-700', C2: 'bg-purple-100 text-purple-700' }

const DATA_TEMPLATES = {
  multiple_choice: JSON.stringify({ question: 'Choose the correct answer:', context: 'Sentence with ___ blank.', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct_index: 0, explanation: 'Explanation here.' }, null, 2),
  fill_blank:      JSON.stringify({ question: 'Complete the sentence:', sentence: 'The ___ (verb) goes here.', correct_answers: ['answer'], hint: 'Optional hint.', explanation: 'Explanation here.' }, null, 2),
  matching:        JSON.stringify({ instruction: 'Match the words:', pairs: [{ left: 'word1', right: 'definition1' }, { left: 'word2', right: 'definition2' }] }, null, 2),
  translation:     JSON.stringify({ instruction: 'Translate into English:', source_text: 'Polish sentence here.', source_language: 'Polish', target_language: 'English', correct_answers: ['English translation.'], accepted_variants: [], explanation: 'Explanation here.' }, null, 2),
}

export default function ManageExercises() {
  const [exercises, setExercises] = useState([])
  const [filterCat, setFilterCat] = useState('all')
  const [filterLvl, setFilterLvl] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [dataError, setDataError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    exerciseService.list().then(setExercises).finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditId(null)
    setForm(EMPTY)
    setDataError('')
    setError('')
    setShowForm(true)
  }

  function openEdit(ex) {
    setEditId(ex.id)
    setForm({
      title: ex.title, description: ex.description ?? '', category: ex.category,
      level: ex.level, exercise_type: ex.exercise_type, order_index: ex.order_index,
      data: JSON.stringify(ex.data, null, 2),
    })
    setDataError('')
    setError('')
    setShowForm(true)
  }

  function handleTypeChange(type) {
    setForm((f) => ({ ...f, exercise_type: type, data: DATA_TEMPLATES[type] }))
  }

  async function handleSave(ev) {
    ev.preventDefault()
    setDataError('')
    setError('')
    let parsedData
    try { parsedData = JSON.parse(form.data) }
    catch { setDataError('Invalid JSON in exercise data.'); return }
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    try {
      const payload = { ...form, data: parsedData, order_index: Number(form.order_index) }
      delete payload.data_str
      if (editId) {
        const updated = await exerciseService.update(editId, payload)
        setExercises((es) => es.map((e) => (e.id === editId ? updated : e)))
      } else {
        const created = await exerciseService.create(payload)
        setExercises((es) => [...es, created])
      }
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this exercise? This will also remove all user progress for it.')) return
    await exerciseService.remove(id)
    setExercises((es) => es.filter((e) => e.id !== id))
  }

  const filtered = exercises.filter((e) => {
    const c = filterCat === 'all' || e.category === filterCat
    const l = filterLvl === 'all' || e.level === filterLvl
    return c && l
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Manage Exercises</h1>
        <button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Add exercise
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl my-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editId ? 'Edit exercise' : 'New exercise'}</h2>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                  <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order index</label>
                  <input type="number" value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Exercise type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => handleTypeChange(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${form.exercise_type === t ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Exercise data (JSON) <span className="text-gray-400 font-normal">— see template above</span>
                </label>
                <textarea
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                  rows={12}
                  spellCheck={false}
                  className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 ${dataError ? 'border-red-400' : 'border-gray-300'}`}
                />
                {dataError && <p className="text-xs text-red-600 mt-1">{dataError}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-3">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50">
                  {saving ? 'Saving…' : (editId ? 'Save changes' : 'Create exercise')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize ${filterCat === c ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {c === 'all' ? 'All' : c}
          </button>
        ))}
        <div className="border-l border-gray-200 mx-1" />
        {['all', ...LEVELS].map((l) => (
          <button key={l} onClick={() => setFilterLvl(l)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${filterLvl === l ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {l === 'all' ? 'All levels' : l}
          </button>
        ))}
        <span className="text-xs text-gray-400 self-center">{filtered.length} exercises</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{ex.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[ex.level]}`}>{ex.level}</span>
                    <span className="text-xs text-gray-400 capitalize">{ex.category}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{ex.exercise_type.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">#{ex.order_index}</span>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => openEdit(ex)} className="text-xs text-primary-600 hover:text-primary-800 font-medium">Edit</button>
                  <button onClick={() => handleDelete(ex.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-12 text-center text-gray-400 text-sm">No exercises found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
