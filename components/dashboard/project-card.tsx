'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Trash2, ExternalLink, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    template: string
    deploy_url: string | null
    deploy_status: string
    updated_at: string
    created_at: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [newName, setNewName] = useState(project.name)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete project')
      toast.success('Project deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setIsDeleting(false)
      setShowDelete(false)
    }
  }

  const handleRename = async () => {
    if (!newName.trim()) return
    setIsRenaming(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) throw new Error('Failed to rename project')
      toast.success('Project renamed')
      router.refresh()
    } catch {
      toast.error('Failed to rename project')
    } finally {
      setIsRenaming(false)
      setShowRename(false)
    }
  }

  const isLive = project.deploy_url && project.deploy_status === 'ready'

  return (
    <>
      <div className="group relative rounded-2xl border border-border bg-card p-5 transition hover:border-primary/60 hover:bg-accent/30">
        {/* Top row: template badge + deploy status */}
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full border border-border bg-secondary px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {project.template}
          </span>
          {isLive ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          ) : project.deploy_status === 'building' ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-500">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              Building
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Draft</span>
          )}
        </div>

        {/* Title and description */}
        <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {project.description || 'No description yet.'}
        </p>

        {/* Bottom row: date + actions */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(project.updated_at ?? project.created_at).toLocaleDateString(
              undefined,
              { month: 'short', day: 'numeric', year: 'numeric' },
            )}
          </span>
          <div className="flex items-center gap-2">
            {isLive && (
              <a
                href={project.deploy_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground transition hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                Visit ↗
              </a>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="rounded p-1 text-muted-foreground transition hover:text-foreground" />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setShowRename(true)}>
                  <Pencil className="mr-2 size-3.5" />
                  Rename
                </DropdownMenuItem>
                {isLive && (
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(project.deploy_url!, '_blank', 'noopener,noreferrer')
                    }
                  >
                    <ExternalLink className="mr-2 size-3.5" />
                    Visit site
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Click overlay to open builder */}
        <a
          href={`/builder/${project.id}`}
          className="absolute inset-0"
          aria-label={`Open ${project.name}`}
        />
      </div>

      {/* Delete confirmation */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              &ldquo;{project.name}&rdquo; will be permanently deleted. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rename-input">Project name</Label>
            <Input
              id="rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRename(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>
              {isRenaming ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
