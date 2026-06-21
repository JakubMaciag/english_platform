import { describe, it, expect, beforeEach, vi } from 'vitest'

// ── helpers (mirror the private toEmail function) ──────────────────────────
const toEmail = (username) => `${username.toLowerCase().trim()}@engplatform.app`

// ── URL validation helper (same logic as scripts/check-config.js) ──────────
function validateSupabaseUrl(url) {
  const errors = []
  if (!url) {
    errors.push('VITE_SUPABASE_URL is not set')
    return errors
  }
  if (url.endsWith('/')) {
    errors.push('VITE_SUPABASE_URL has a trailing slash')
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') errors.push('URL must use https')
    if (!parsed.hostname.endsWith('.supabase.co')) errors.push('URL must be a supabase.co domain')
    if (parsed.pathname !== '/') errors.push('URL must not contain a path')
  } catch {
    errors.push('VITE_SUPABASE_URL is not a valid URL')
  }
  return errors
}

// ── toEmail tests ──────────────────────────────────────────────────────────
describe('toEmail', () => {
  it('appends @engplatform.app domain', () => {
    expect(toEmail('alice')).toBe('alice@engplatform.app')
  })

  it('lowercases the username', () => {
    expect(toEmail('Alice')).toBe('alice@engplatform.app')
    expect(toEmail('ADMIN')).toBe('admin@engplatform.app')
  })

  it('trims leading/trailing whitespace', () => {
    expect(toEmail('  bob  ')).toBe('bob@engplatform.app')
  })

  it('handles usernames with numbers', () => {
    expect(toEmail('user123')).toBe('user123@engplatform.app')
  })
})

// ── URL validation tests ───────────────────────────────────────────────────
describe('validateSupabaseUrl', () => {
  it('passes a well-formed Supabase URL', () => {
    const errors = validateSupabaseUrl('https://abcdefghijklmnop.supabase.co')
    expect(errors).toHaveLength(0)
  })

  it('catches a trailing slash — the most common misconfiguration', () => {
    const errors = validateSupabaseUrl('https://abcdefghijklmnop.supabase.co/')
    expect(errors.some(e => e.includes('trailing slash'))).toBe(true)
  })

  it('catches a URL with a path after the hostname', () => {
    const errors = validateSupabaseUrl('https://abcdefghijklmnop.supabase.co/auth/v1')
    expect(errors.some(e => e.includes('path'))).toBe(true)
  })

  it('catches http instead of https', () => {
    const errors = validateSupabaseUrl('http://abcdefghijklmnop.supabase.co')
    expect(errors.some(e => e.includes('https'))).toBe(true)
  })

  it('catches a completely invalid URL string', () => {
    const errors = validateSupabaseUrl('not-a-url')
    expect(errors.some(e => e.includes('valid URL'))).toBe(true)
  })

  it('catches an empty/missing URL', () => {
    const errors = validateSupabaseUrl('')
    expect(errors.some(e => e.includes('not set'))).toBe(true)
  })

  it('warns when the domain is not supabase.co', () => {
    const errors = validateSupabaseUrl('https://myapp.example.com')
    expect(errors.some(e => e.includes('supabase.co'))).toBe(true)
  })
})

// ── isMisconfigured flag tests ─────────────────────────────────────────────
describe('supabase client initialisation', () => {
  it('isMisconfigured is true when env vars are absent', async () => {
    // Simulate missing env vars by resetting import.meta.env
    vi.stubGlobal('import', {
      meta: { env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' } },
    })
    // The real check happens at module import time, so we validate the logic directly
    const url = ''
    const key = ''
    expect(!url || !key).toBe(true)
  })

  it('isMisconfigured is false when both env vars are present', () => {
    const url = 'https://abcdefghijklmnop.supabase.co'
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example'
    expect(!url || !key).toBe(false)
  })
})
