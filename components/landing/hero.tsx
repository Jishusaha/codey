import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { MockIde } from './mock-ide'

export function Hero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-20 text-center sm:px-6 sm:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" />
          AI-powered web IDE for students
        </div>
        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Build, run, and deploy your portfolio in one place
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Describe your idea in plain English. SmartDEploy writes the code,
          previews it live in your browser, fixes its own errors, and ships it
          to a real URL — no setup, no config, no fuss.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            className={buttonVariants({ size: 'lg', className: 'gap-2' })}
            href={isAuthed ? '/dashboard' : '/auth/sign-up'}
          >
            Start building free
            <ArrowRight className="size-4" />
          </Link>
          <a
            className={buttonVariants({ size: 'lg', variant: 'outline' })}
            href="#how"
          >
            See how it works
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <MockIde />
      </div>
    </section>
  )
}
