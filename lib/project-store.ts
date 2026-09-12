import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Project, ProjectFiles, ProjectTemplate } from './types'

const DATA_DIR = path.join(process.cwd(), '.smartdeploy')
const DATA_FILE = path.join(DATA_DIR, 'projects.json')

export type StoredProject = Project

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8')
  }
}

async function readStore(): Promise<StoredProject[]> {
  await ensureStore()

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeStore(projects: StoredProject[]) {
  await ensureStore()
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf8')
}

export function isMissingProjectsTableError(error: unknown) {
  const record = error && typeof error === 'object' ? error as Record<string, unknown> : null
  const message = error instanceof Error
    ? error.message
    : typeof record?.message === 'string'
      ? record.message
      : String(error ?? '')
  const code = typeof record?.code === 'string' ? record.code : ''

  return (
    code === 'PGRST205' ||
    message.includes('Could not find the table') ||
    message.includes('public.projects') ||
    message.includes('PGRST205') ||
    message.includes('relation \"public.projects\" does not exist') ||
    message.includes('projects in the schema cache')
  )
}

export async function listProjectsForUser(userId: string) {
  const projects = await readStore()

  return projects
    .filter((project) => project.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? b.created_at).getTime() -
        new Date(a.updated_at ?? a.created_at).getTime(),
    )
}

export async function getProjectForUser(id: string, userId: string) {
  const projects = await readStore()
  return projects.find((project) => project.id === id && project.user_id === userId) ?? null
}

export async function createProjectForUser(input: {
  user_id: string
  name: string
  description?: string
  template: ProjectTemplate
  files: ProjectFiles
  entry: string
}) {
  const projects = await readStore()
  const now = new Date().toISOString()

  const project: StoredProject = {
    id: crypto.randomUUID(),
    user_id: input.user_id,
    name: input.name,
    description: input.description ?? '',
    template: input.template,
    files: input.files,
    entry: input.entry,
    deploy_url: null,
    deploy_status: 'idle',
    deployment_id: null,
    created_at: now,
    updated_at: now,
  }

  projects.unshift(project)
  await writeStore(projects)
  return project
}

export async function updateProjectForUser(
  id: string,
  userId: string,
  update: Partial<StoredProject>,
) {
  const projects = await readStore()
  const index = projects.findIndex((project) => project.id === id && project.user_id === userId)

  if (index === -1) return null

  const updated = {
    ...projects[index],
    ...update,
    updated_at: new Date().toISOString(),
  }

  projects[index] = updated
  await writeStore(projects)
  return updated
}

export async function deleteProjectForUser(id: string, userId: string) {
  const projects = await readStore()
  const filtered = projects.filter((project) => !(project.id === id && project.user_id === userId))
  await writeStore(filtered)
  return filtered.length !== projects.length
}
