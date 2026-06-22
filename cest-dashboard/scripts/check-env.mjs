const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('\n❌ Vercel build blocked: Supabase env vars are missing.\n')
  console.error('In Vercel → Project → Settings → Environment Variables, add:')
  console.error('  VITE_SUPABASE_URL')
  console.error('  VITE_SUPABASE_ANON_KEY')
  console.error('\nEnable for Production, Preview, and Development.')
  console.error('Then redeploy with "Clear build cache".\n')
  process.exit(1)
}

console.log('✓ Supabase environment variables found')
