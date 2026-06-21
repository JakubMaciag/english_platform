import { useEffect, useState } from 'react'
import { profileService } from '../../services/supabase'

const ROLES = ['user', 'admin']
const LEVELS = ['B2', 'C1', 'C2']

const LEVEL_COLOR = { B2: 'bg-green-100 text-green-700', C1: 'bg-blue-100 text-blue-700', C2: 'bg-purple-100 text-purple-700' }
const ROLE_COLOR  = { user: 'bg-gray-100 text-gray-600', admin: 'bg-orange-100 text-orange-700' }

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // userId
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    profileService.getAllProfiles()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(user) {
    setEditing(user.id)
    setEditData({ role: user.role, level: user.level })
    setError('')
  }

  async function saveEdit(userId) {
    setSaving(true)
    setError('')
    try {
      const updated = await profileService.updateProfile(userId, editData)
      setUsers((us) => us.map((u) => (u.id === userId ? updated : u)))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Username</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Level</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Role</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Joined</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.username}</td>
                  <td className="px-5 py-3">
                    {editing === u.id ? (
                      <select
                        value={editData.level}
                        onChange={(e) => setEditData((d) => ({ ...d, level: e.target.value }))}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        {LEVELS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[u.level]}`}>{u.level}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editing === u.id ? (
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value }))}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLOR[u.role]}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {editing === u.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => saveEdit(u.id)}
                          disabled={saving}
                          className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 px-2"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(u)}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-12 text-center text-gray-400">No users found.</p>
          )}
        </div>
      )}
    </div>
  )
}
