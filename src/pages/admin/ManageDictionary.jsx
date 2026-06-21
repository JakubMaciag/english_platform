import { useEffect, useState } from 'react'
import { dictionaryService } from '../../services/supabase'

const EMPTY = { word: '', translation: '', dict_type: 'pl-en', description: '', example_sentence: '', level: 'all' }

const DICT_TYPES = ['pl-en', 'en-pl', 'en-en']
const LEVELS     = ['all', 'B2', 'C1', 'C2']

export default function ManageDictionary() {
  const [entries, setEntries] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const PAGE_SIZE = 15

  async function load() {
    setLoading(true)
    try {
      const { data, count: c } = await dictionaryService.search({
        query: search, dictType: filterType, level: 'all', page, pageSize: PAGE_SIZE,
      })
      setEntries(data)
      setCount(c)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, filterType, page])

  function openCreate() {
    setEditId(null)
    setForm(EMPTY)
    setError('')
    setShowForm(true)
  }

  function openEdit(e) {
    setEditId(e.id)
    setForm({ word: e.word, translation: e.translation, dict_type: e.dict_type, description: e.description ?? '', example_sentence: e.example_sentence ?? '', level: e.level })
    setError('')
    setShowForm(true)
  }

  async function handleSave(ev) {
    ev.preventDefault()
    if (!form.word.trim() || !form.translation.trim()) { setError('Word and translation are required.'); return }
    setSaving(true)
    setError('')
    try {
      if (editId) {
        const updated = await dictionaryService.update(editId, form)
        setEntries((es) => es.map((e) => (e.id === editId ? updated : e)))
      } else {
        const created = await dictionaryService.create(form)
        setEntries((es) => [created, ...es])
        setCount((c) => c + 1)
      }
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry?')) return
    await dictionaryService.remove(id)
    setEntries((es) => es.filter((e) => e.id !== id))
    setCount((c) => c - 1)
  }

  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Manage Dictionary</h1>
        <button
          onClick={openCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add entry
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editId ? 'Edit entry' : 'New entry'}</h2>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Word *</label>
                  <input value={form.word} onChange={(e) => setForm((f) => ({ ...f, word: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Word" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Translation *</label>
                  <input value={form.translation} onChange={(e) => setForm((f) => ({ ...f, translation: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Translation" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select value={form.dict_type} onChange={(e) => setForm((f) => ({ ...f, dict_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {DICT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                  <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Descriptive explanation (optional)" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Example sentence</label>
                <input value={form.example_sentence} onChange={(e) => setForm((f) => ({ ...f, example_sentence: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Example usage (optional)" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50">
                  {saving ? 'Saving…' : (editId ? 'Save changes' : 'Add entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text" placeholder="Search…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
        />
        {['all', ...DICT_TYPES].map((t) => (
          <button key={t} onClick={() => { setFilterType(t); setPage(0) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${filterType === t ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {t === 'all' ? 'All types' : t}
          </button>
        ))}
        <span className="text-xs text-gray-400 self-center">{count} entries</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : entries.length === 0 ? (
          <p className="py-12 text-center text-gray-400 text-sm">No entries found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Word</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Translation</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Level</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{e.word}</td>
                  <td className="px-4 py-2.5 text-gray-600 max-w-[200px] truncate">{e.translation}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.dict_type}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.level}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => openEdit(e)} className="text-xs text-primary-600 hover:text-primary-800 font-medium mr-3">Edit</button>
                    <button onClick={() => handleDelete(e.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
        </div>
      )}
    </div>
  )
}
