const steps = [
  {
    step: '01',
    title: 'Describe your idea',
    desc: 'Tell the AI what your portfolio should look like and what it should include.',
  },
  {
    step: '02',
    title: 'Edit & preview live',
    desc: 'Tweak the generated code in a real editor and watch changes render instantly.',
  },
  {
    step: '03',
    title: 'Deploy to a live URL',
    desc: 'Hit deploy and share your new website with recruiters, friends, and the world.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From idea to live site in three steps
          </h2>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="relative">
              <div className="font-mono text-sm font-semibold text-primary">
                {s.step}
              </div>
              <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
