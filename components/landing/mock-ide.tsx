import { Sparkles } from 'lucide-react'

export function MockIde() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-destructive/70" />
          <span className="size-3 rounded-full bg-chart-3/70" />
          <span className="size-3 rounded-full bg-success/70" />
        </div>
        <span className="ml-3 font-mono text-xs text-muted-foreground">
          portfolio — SmartDEploy
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr_1fr]">
        {/* AI chat pane */}
        <div className="border-b border-border p-4 md:border-b-0 md:border-r">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> AI Assistant
          </div>
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
              Add a dark hero with my name and a projects grid
            </div>
            <div className="w-fit max-w-[90%] rounded-lg rounded-bl-sm bg-secondary px-3 py-2 text-secondary-foreground">
              Done. I created App.js with a hero section and a responsive
              grid of project cards.
            </div>
          </div>
        </div>

        {/* Editor pane */}
        <div className="border-b border-border bg-background/50 p-4 font-mono text-[11px] leading-relaxed md:border-b-0 md:border-r">
          <div className="mb-3 text-xs text-muted-foreground">App.js</div>
          <pre className="text-muted-foreground">
            <span className="text-chart-5">export default</span>{' '}
            <span className="text-chart-3">function</span>{' '}
            <span className="text-primary">App</span>() {'{'}
            {'\n'}  <span className="text-chart-5">return</span> (
            {'\n'}    <span className="text-success">&lt;main&gt;</span>
            {'\n'}      <span className="text-success">&lt;h1&gt;</span>
            Jordan Rivera
            <span className="text-success">&lt;/h1&gt;</span>
            {'\n'}      <span className="text-success">&lt;Grid</span>{' '}
            projects={'{'}data{'}'} <span className="text-success">/&gt;</span>
            {'\n'}    <span className="text-success">&lt;/main&gt;</span>
            {'\n'}  );{'\n'}
            {'}'}
          </pre>
        </div>

        {/* Preview pane */}
        <div className="bg-[#0f1117] p-4">
          <div className="mb-3 text-xs text-muted-foreground">Preview</div>
          <div className="space-y-2 text-center">
            <div className="mx-auto w-fit rounded-full border border-border px-2 py-0.5 text-[9px] text-primary">
              Available for internships
            </div>
            <div className="text-sm font-semibold">Jordan Rivera</div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <div className="h-8 rounded bg-card" />
              <div className="h-8 rounded bg-card" />
              <div className="h-8 rounded bg-card" />
              <div className="h-8 rounded bg-card" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
