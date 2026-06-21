import { create } from 'zustand'
import { supabase, profileService } from '../services/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  async fetchProfile(userId) {
    try {
      const profile = await profileService.getProfile(userId)
      set({ profile })
      return profile
    } catch {
      return null
    }
  },

  async init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user })
      await get().fetchProfile(session.user.id)
    }
    set({ loading: false })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  async logout() {
    const { supabase: sb } = await import('../services/supabase')
    await sb.auth.signOut()
    set({ user: null, profile: null })
  },

  isAdmin() {
    return get().profile?.role === 'admin'
  },
}))

export default useAuthStore
