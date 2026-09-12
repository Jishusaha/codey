import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ProjectFiles } from '@/lib/types'
import {
  deleteProjectForUser,
  getProjectForUser,
  isMissingProjectsTableError,
  updateProjectForUser,
} from '@/lib/project-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

    if (error) {
      if (isMissingProjectsTableError(error)) {
        const project = await getProjectForUser(id, user.id)
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        return NextResponse.json({ project })
      }
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ project: data })
  } catch (error) {
    if (isMissingProjectsTableError(error)) {
      const project = await getProjectForUser(id, user.id)
      if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      return NextResponse.json({ project })
    }
    return NextResponse.json({ error: 'Unable to load project' }, { status: 404 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim()
  if (typeof body.description === 'string') update.description = body.description
  if (typeof body.entry === 'string') update.entry = body.entry
  if (body.files && typeof body.files === 'object') update.files = body.files as ProjectFiles
  if (typeof body.deploy_url === 'string') update.deploy_url = body.deploy_url
  if (typeof body.deploy_status === 'string') update.deploy_status = body.deploy_status
  if (typeof body.deployment_id === 'string') update.deployment_id = body.deployment_id

  try {
    const { error } = await supabase.from('projects').update(update).eq('id', id)

    if (error) {
      if (isMissingProjectsTableError(error)) {
        const updated = await updateProjectForUser(id, user.id, update as any)
        if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isMissingProjectsTableError(error)) {
      const updated = await updateProjectForUser(id, user.id, update as any)
      if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Unable to update project' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      if (isMissingProjectsTableError(error)) {
        const deleted = await deleteProjectForUser(id, user.id)
        if (!deleted) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isMissingProjectsTableError(error)) {
      const deleted = await deleteProjectForUser(id, user.id)
      if (!deleted) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Unable to delete project' }, { status: 500 })
  }
}
