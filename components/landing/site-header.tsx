import Link from 'next/link'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'

export function SiteHeader({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#deploy" className="transition-colors hover:text-foreground">
            Deploy
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Link className={buttonVariants()} href="/dashboard">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                className={buttonVariants({ variant: 'ghost' })}
                href="/auth/login"
              >
                Log in
              </Link>
              <Link className={buttonVariants()} href="/auth/sign-up">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
