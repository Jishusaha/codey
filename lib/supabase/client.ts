import { createBrowserClient } from '@supabase/ssr'

function getMissingSupabaseConfigError() {
  return new Error(
    'Supabase is not configured. Copy .env.example to .env.local and add your project URL and anon key to enable auth.',
  )
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        signUp: async () => ({
          data: { user: null, session: null },
          error: getMissingSupabaseConfigError(),
        }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: getMissingSupabaseConfigError(),
        }),
        getUser: async () => ({
          data: { user: null },
          error: getMissingSupabaseConfigError(),
        }),
      },
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    // Secure cookies in production; not in dev, so localhost still works.
    cookieOptions: { secure: process.env.NODE_ENV === 'production' },
  })
}
