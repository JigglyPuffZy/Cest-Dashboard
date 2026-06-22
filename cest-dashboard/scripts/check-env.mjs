import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readProductionFile() {
  const path = resolve(root, '.env.production')
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim()
  }
  return out
}

const fileEnv = readProductionFile()
const url = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('\n❌ Build blocked: Supabase env vars missing.\n')
  process.exit(1)
}

console.log('✓ Supabase environment variables found')
