import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(url, key)

// Auth helpers — username is stored as {username}@engplatform.app internally
const toEmail = (username) => `${username.toLowerCase().trim()}@engplatform.app`

export const authService = {
  async register(username, password, level = 'B2') {
    const { data, error } = await supabase.auth.signUp({
      email: toEmail(username),
      password,
      options: { data: { username } },
    })
    if (error) throw error
    // update level after profile is auto-created by trigger
    if (data.user) {
      await supabase.from('profiles').update({ level }).eq('id', data.user.id)
    }
    return data
  },

  async login(username, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
}

export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
}

export const dictionaryService = {
  async search({ query = '', dictType = 'all', level = 'all', page = 0, pageSize = 20 }) {
    let q = supabase
      .from('dictionary_entries')
      .select('*', { count: 'exact' })
      .order('word')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (dictType !== 'all') q = q.eq('dict_type', dictType)
    if (level !== 'all') q = q.or(`level.eq.${level},level.eq.all`)
    if (query) q = q.or(`word.ilike.%${query}%,translation.ilike.%${query}%`)

    const { data, error, count } = await q
    if (error) throw error
    return { data, count }
  },

  async create(entry) {
    const { data, error } = await supabase
      .from('dictionary_entries')
      .insert(entry)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, entry) {
    const { data, error } = await supabase
      .from('dictionary_entries')
      .update(entry)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async remove(id) {
    const { error } = await supabase.from('dictionary_entries').delete().eq('id', id)
    if (error) throw error
  },
}

export const exerciseService = {
  async list({ category = 'all', level = 'all' } = {}) {
    let q = supabase.from('exercises').select('*').order('order_index')
    if (category !== 'all') q = q.eq('category', category)
    if (level !== 'all') q = q.eq('level', level)
    const { data, error } = await q
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(exercise) {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, exercise) {
    const { data, error } = await supabase
      .from('exercises')
      .update(exercise)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async remove(id) {
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (error) throw error
  },
}

export const progressService = {
  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from('user_exercise_progress')
      .select('*, exercises(title, category, level, exercise_type)')
      .eq('user_id', userId)
      .order('last_attempt_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getForExercise(userId, exerciseId) {
    const { data, error } = await supabase
      .from('user_exercise_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async upsert(userId, exerciseId, updates) {
    const { data, error } = await supabase
      .from('user_exercise_progress')
      .upsert(
        {
          user_id: userId,
          exercise_id: exerciseId,
          ...updates,
          last_attempt_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,exercise_id' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getAllProgress() {
    const { data, error } = await supabase
      .from('user_exercise_progress')
      .select('*, profiles(username, level), exercises(title, category, level)')
      .order('last_attempt_at', { ascending: false })
    if (error) throw error
    return data
  },
}
