import { useEffect, useState, useCallback } from 'react'
import { dictionaryService } from '../services/supabase'
import useAuthStore from '../store/authStore'

const DICT_TYPES = [
  { value: 'all',   label: 'All' },
  { value: 'pl-en', label: 'Polish → English' },
  { value: 'en-pl', label: 'English → Polish' },
  { value: 'en-en', label: 'English → English' },
]

const LEVELS = [
  { value: 'all', label: 'All levels' },
  { value: 'B2',  label: 'B2' },
  { value: 'C1',  label: 'C1' },
  { value: 'C2',  label: 'C2' },
]

const LEVEL_COLOR = { B2: 'bg-green-100 text-green-700', C1: 'bg-blue-100 text-blue-700', C2: 'bg-purple-100 text-purple-700', all: 'bg-gray-100 text-gray-600' }
const TYPE_COLOR  = { 'pl-en': 'bg-orange-50 text-orange-600', 'en-pl': 'bg-teal-50 text-teal-600', 'en-en': 'bg-indigo-50 text-indigo-600' }
const TYPE_LABEL  = { 'pl-en': 'PL→EN', 'en-pl': 'EN→PL', 'en-en': 'EN→EN' }

const PAGE_SIZE = 20

const EMPTY_FORM = { word: '', translation: '', dict_type: 'en-pl', level: 'B2', description: '', example_sentence: '' }

function EntryModal({ entry, onClose, onSaved, userId }) {
  const isEdit = !!entry
  const [form, setForm] = useState(
    isEdit
      ? { word: entry.word, translation: entry.translation, dict_type: entry.dict_type, level: entry.level, description: entry.description || '', example_sentence: entry.example_sentence || '' }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.word.trim() || !form.translation.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        word: form.word.trim(),
        translation: form.translation.trim(),
        dict_type: form.dict_type,
        level: form.level,
        description: form.description.trim() || null,
        example_sentence: form.example_sentence.trim() || null,
      }
      if (isEdit) {
        await dictionaryService.updateUserEntry(entry.id, userId, payload)
      } else {
        await dictionaryService.createUserEntry(userId, payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit word' : 'Add word to my dictionary'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={form.dict_type}
                onChange={e => set('dict_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pl-en">Polish → English</option>
                <option value="en-pl">English → Polish</option>
                <option value="en-en">English → English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
              <select
                value={form.level}
                onChange={e => set('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Word / phrase <span className="text-red-400">*</span></label>
            <input
              required
              value={form.word}
              onChange={e => set('word', e.target.value)}
              placeholder={form.dict_type === 'pl-en' ? 'e.g. niejednoznaczny' : 'e.g. ambiguous'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Translation / definition <span className="text-red-400">*</span></label>
            <input
              required
              value={form.translation}
              onChange={e => set('translation', e.target.value)}
              placeholder={form.dict_type === 'pl-en' ? 'e.g. ambiguous' : form.dict_type === 'en-pl' ? 'e.g. niejednoznaczny' : 'e.g. having more than one meaning'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              placeholder="Additional explanation, usage notes…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Example sentence <span className="text-gray-400">(optional)</span></label>
            <input
              value={form.example_sentence}
              onChange={e => set('example_sentence', e.target.value)}
              placeholder="e.g. The results were ambiguous and hard to interpret."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.word.trim() || !form.translation.trim()}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dictionary() {
  const user = useAuthStore(s => s.user)

  const [entries, setEntries] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [dictType, setDictType] = useState('all')
  const [level, setLevel] = useState('all')
  const [myWordsOnly, setMyWordsOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | entry object (edit)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data, count: c } = await dictionaryService.search({
        query, dictType, level, page, pageSize: PAGE_SIZE,
        userOnly: myWordsOnly, userId: user?.id,
      })
      setEntries(data)
      setCount(c)
    } finally {
      setLoading(false)
    }
  }, [query, dictType, level, page, myWordsOnly, user?.id])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [query, dictType, level, myWordsOnly])

  async function handleDelete(entry) {
    if (!window.confirm(`Delete "${entry.word}"?`)) return
    try {
      await dictionaryService.removeUserEntry(entry.id, user.id)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  function handleSaved() {
    setModal(null)
    load()
  }

  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Dictionary</h1>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Add word
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <input
          type="text"
          placeholder="Search word or translation…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="flex flex-wrap gap-2">
          {DICT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setDictType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                dictType === t.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="border-l border-gray-200 mx-1" />
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLevel(l.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                level === l.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {l.label}
            </button>
          ))}
          <div className="border-l border-gray-200 mx-1" />
          <button
            onClick={() => setMyWordsOnly(v => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              myWordsOnly
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            ★ My words
          </button>
        </div>
        <p className="text-xs text-gray-400">{count} entries found</p>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">{myWordsOnly ? '📝' : '🔍'}</p>
          <p>{myWordsOnly ? 'No personal words yet. Click "Add word" to start.' : 'No entries found.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const isOwn = e.user_id === user?.id
            return (
              <div key={e.id} className={`bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow ${isOwn ? 'border-amber-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-gray-900">{e.word}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[e.dict_type]}`}>
                        {TYPE_LABEL[e.dict_type]}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[e.level]}`}>
                        {e.level}
                      </span>
                      {isOwn && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          ★ My word
                        </span>
                      )}
                    </div>
                    <p className="text-primary-700 font-semibold mt-1">{e.translation}</p>
                    {e.description && (
                      <p className="text-sm text-gray-500 mt-1">{e.description}</p>
                    )}
                    {e.example_sentence && (
                      <p className="text-sm text-gray-400 italic mt-1.5 border-l-2 border-gray-200 pl-2">
                        {e.example_sentence}
                      </p>
                    )}
                  </div>
                  {isOwn && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => setModal(e)}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e)}
                        className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <EntryModal
          entry={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          userId={user?.id}
        />
      )}
    </div>
  )
}
