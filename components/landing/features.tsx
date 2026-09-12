import { Bot, Code2, Play, Rocket, Save, Wand2 } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Prompt to project',
    desc: 'Describe what you want and the AI scaffolds a full file structure — components, styles, and content included.',
  },
  {
    icon: Code2,
    title: 'Real code editor',
    desc: 'A Monaco-powered editor (the engine behind VS Code) with syntax highlighting and a smooth multi-file workflow.',
  },
  {
    icon: Play,
    title: 'Live in-browser preview',
    desc: 'Your site runs instantly in the browser as you type. No local setup or install steps required.',
  },
  {
    icon: Wand2,
    title: 'Self-healing code',
    desc: 'When something breaks, the AI reads the error and proposes a fix so you keep moving forward.',
  },
  {
    icon: Save,
    title: 'Saved to the cloud',
    desc: 'Every project is stored securely to your account so you can pick up right where you left off.',
  },
  {
    icon: Rocket,
    title: 'One-click deploy',
    desc: 'Ship your portfolio to a real, shareable URL in seconds — perfect for applications and resumes.',
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need, nothing you don&apos;t
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          A complete toolchain that takes you from a blank idea to a live
          website — all inside one browser tab.
        </p>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-medium">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
