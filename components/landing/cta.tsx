import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export function Cta({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section id="deploy" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Your portfolio is one prompt away
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Join students who are building and shipping their work with
          SmartDEploy. Free to start — no credit card required.
        </p>
        <Link
          className={buttonVariants({ size: 'lg', className: 'mt-8 gap-2' })}
          href={isAuthed ? '/dashboard' : '/auth/sign-up'}
        >
          Get started
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Logo />
        <p className="text-sm text-muted-foreground">
          Built for students who ship. © {new Date().getFullYear()} SmartDEploy.
        </p>
      </div>
    </footer>
  )
}
