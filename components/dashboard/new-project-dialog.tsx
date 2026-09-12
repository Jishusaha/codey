'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ProjectTemplate } from '@/lib/types'
import { TEMPLATES } from '@/lib/templates'
import { cn } from '@/lib/utils'

export function NewProjectDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [template, setTemplate] = useState<ProjectTemplate>('react')
  const [loading, setLoading] = useState(false)

  const create = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, template }),
      })
      if (!res.ok) throw new Error('Failed to create project')
      const { id } = await res.json()
      router.push(`/builder/${id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="size-4" />
        New project
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Pick a starting point. You can build the rest with the AI assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="My portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(TEMPLATES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors',
                    template === t.id
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={create} disabled={loading} className="gap-2">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Create & open
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
