import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { NewProjectDialog } from '@/components/dashboard/new-project-dialog'
import { ProjectCard } from '@/components/dashboard/project-card'
import { createClient } from '@/lib/supabase/server'
import { isMissingProjectsTableError, listProjectsForUser } from '@/lib/project-store'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  let projects: any[] = []
  let error: { message: string } | null = null

  try {
    const response = await supabase
      .from('projects')
      .select(
        'id, name, description, template, deploy_url, deploy_status, updated_at, created_at',
      )
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    projects = response.data ?? []
    error = response.error ? { message: response.error.message } : null
  } catch (caught) {
    if (isMissingProjectsTableError(caught)) {
      projects = await listProjectsForUser(user.id)
      error = null
    } else {
      error = { message: 'Unable to load projects' }
    }
  }

  if (error && isMissingProjectsTableError(error)) {
    projects = await listProjectsForUser(user.id)
    error = null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader email={user.email ?? 'user@example.com'} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">Your projects</h1>
          </div>
          <NewProjectDialog />
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error.message}
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold">No projects yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first project to start building your portfolio.
            </p>
            <div className="mt-6 flex justify-center">
              <NewProjectDialog />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
