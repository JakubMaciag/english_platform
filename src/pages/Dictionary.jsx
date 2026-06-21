import { useEffect, useState, useCallback } from 'react'
import { dictionaryService } from '../services/supabase'

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

export default function Dictionary() {
  const [entries, setEntries] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [dictType, setDictType] = useState('all')
  const [level, setLevel] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data, count: c } = await dictionaryService.search({ query, dictType, level, page, pageSize: PAGE_SIZE })
      setEntries(data)
      setCount(c)
    } finally {
      setLoading(false)
    }
  }, [query, dictType, level, page])

  useEffect(() => { load() }, [load])

  // Reset page when filters change
  useEffect(() => { setPage(0) }, [query, dictType, level])

  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dictionary</h1>

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
          <p className="text-4xl mb-3">🔍</p>
          <p>No entries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-gray-900">{e.word}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[e.dict_type]}`}>
                      {TYPE_LABEL[e.dict_type]}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[e.level]}`}>
                      {e.level}
                    </span>
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
              </div>
            </div>
          ))}
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
    </div>
  )
}
