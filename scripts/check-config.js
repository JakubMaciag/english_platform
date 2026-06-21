#!/usr/bin/env node
// Pre-build config validation — runs before every build.
// Catches malformed Supabase URL/key before they cause cryptic runtime errors.

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

const errors = []
const warnings = []

// --- URL checks ---
if (!url) {
  errors.push('VITE_SUPABASE_URL is not set')
} else {
  if (url.endsWith('/')) {
    errors.push(`VITE_SUPABASE_URL has a trailing slash — remove it.\n     Got: "${url}"\n     Fix: "${url.replace(/\/+$/, '')}"`)
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') {
      errors.push(`VITE_SUPABASE_URL must start with https://. Got: "${url}"`)
    }
    if (!parsed.hostname.endsWith('.supabase.co')) {
      warnings.push(`VITE_SUPABASE_URL hostname doesn't look like a Supabase URL: "${parsed.hostname}"`)
    }
    if (parsed.pathname !== '/') {
      errors.push(`VITE_SUPABASE_URL should not contain a path. Got: "${url}" — use only the base URL.`)
    }
  } catch {
    errors.push(`VITE_SUPABASE_URL is not a valid URL: "${url}"`)
  }
}

// --- Key checks ---
if (!key) {
  errors.push('VITE_SUPABASE_ANON_KEY is not set')
} else if (key.length < 100) {
  warnings.push(`VITE_SUPABASE_ANON_KEY is unusually short (${key.length} chars) — double-check it's the anon/public key, not a truncated value.`)
}

// --- Report ---
if (warnings.length > 0) {
  console.warn('\n⚠️  Supabase config warnings:')
  warnings.forEach(w => console.warn(`   - ${w}`))
}

if (errors.length > 0) {
  console.error('\n❌ Supabase configuration errors — build aborted:\n')
  errors.forEach(e => console.error(`   • ${e}\n`))
  console.error('Fix the above issues in your .env file (local) or GitHub Actions secrets (CI).\n')
  process.exit(1)
}

const displayUrl = url ? url.replace(/^https:\/\/([^.]+).*/, 'https://$1.supabase.co') : ''
console.log(`\n✅ Supabase configuration OK`)
console.log(`   URL: ${displayUrl}`)
console.log(`   Key: ${key ? key.slice(0, 20) + '…' : '(missing)'}\n`)
