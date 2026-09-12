'use client'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Supabase does not reveal whether an email is already registered, so the
// fallback stays generic. Validation failures describe the user's own input and
// are not an enumeration oracle, so surface them.
function signUpErrorMessage(error: unknown): string {
  const { code, status, message } = (error ?? {}) as {
    code?: string
    status?: number
    message?: string
  }

  if (message?.includes('Supabase is not configured')) {
    return message
  }

  if (
    message?.toLowerCase().includes('email address') &&
    message.toLowerCase().includes('invalid')
  ) {
    return 'Please use a real email address — example and test domains are not supported.'
  }

  if (code === 'weak_password') {
    return 'Please choose a stronger password.'
  }
  // Example and test domains are rejected at validation, before any send.
  if (code === 'email_address_invalid') {
    return 'Please use a real email address — example and test domains are not supported.'
  }
  // Built-in SMTP only delivers to addresses in the project's own organization.
  if (code === 'email_address_not_authorized') {
    return 'We cannot send confirmation email to that address. Please use a different one.'
  }
  if (code === 'validation_failed') {
    return 'Please check the details you entered.'
  }
  if (code === 'over_email_send_rate_limit' || status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  return 'Unable to complete sign-up. Please try again.'
}

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isConfigured = isSupabaseConfigured()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfigured) {
      setError(
        'Authentication is not configured yet. Copy .env.example to .env.local and add your Supabase URL and anon key.',
      )
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      console.error('Sign-up error:', error)
      setError(signUpErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Start building and deploying in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="repeat-password">Repeat Password</Label>
                    </div>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {!isConfigured && (
                    <p className="text-xs text-muted-foreground">
                      Add your Supabase credentials in the local environment first.
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !isConfigured}
                  >
                    {isLoading ? 'Creating an account...' : 'Sign up'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="underline underline-offset-4"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
