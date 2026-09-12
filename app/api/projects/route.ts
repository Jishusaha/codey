import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTemplate } from '@/lib/templates'
import type { ProjectTemplate } from '@/lib/types'
import {
  createProjectForUser,
  isMissingProjectsTableError,
  listProjectsForUser,
} from '@/lib/project-store'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabase
      .from('projects')
      .select(
        'id, name, description, template, deploy_url, deploy_status, updated_at, created_at',
      )
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      if (isMissingProjectsTableError(error)) {
        const projects = await listProjectsForUser(user.id)
        return NextResponse.json({ projects })
      }
      console.error('Project creation failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects: data })
  } catch (error) {
    if (isMissingProjectsTableError(error)) {
      const projects = await listProjectsForUser(user.id)
      return NextResponse.json({ projects })
    }
    return NextResponse.json({ error: 'Unable to load projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Untitled Project'
  const templateId: ProjectTemplate = body.template === 'static' ? 'static' : 'react'
  const template = getTemplate(templateId)

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        description: body.description ?? '',
        template: templateId,
        files: template.files,
        entry: template.entry,
      })
      .select('id')
      .single()

    if (error) {
      if (isMissingProjectsTableError(error)) {
        const project = await createProjectForUser({
          user_id: user.id,
          name,
          description: body.description ?? '',
          template: templateId,
          files: template.files,
          entry: template.entry,
        })
        return NextResponse.json({ id: project.id })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    if (isMissingProjectsTableError(error)) {
      const project = await createProjectForUser({
        user_id: user.id,
        name,
        description: body.description ?? '',
        template: templateId,
        files: template.files,
        entry: template.entry,
      })
      return NextResponse.json({ id: project.id })
    }
    console.error('Project creation fallback failed:', error)
    return NextResponse.json({ error: 'Unable to create project' }, { status: 500 })
  }
}
