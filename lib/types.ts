export type ProjectFiles = Record<string, string>

export type DeployStatus = 'idle' | 'building' | 'ready' | 'error'

export type ProjectTemplate = 'react' | 'static'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string
  template: ProjectTemplate
  files: ProjectFiles
  entry: string
  deploy_url: string | null
  deploy_status: DeployStatus
  deployment_id: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface FileMap {
  [filePath: string]: {
    code: string;
    active?: boolean;
    hidden?: boolean;
  };
}

export interface GenerationResponse {
  files: { path: string; content: string }[];
  explanation: string;
}
