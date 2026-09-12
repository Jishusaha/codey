export interface AiModelOption {
  id: string
  label: string
  provider: string
  description: string
}

// Gateway model IDs in provider/model form. Auth is zero-config on Vercel.
export const AI_MODELS: AiModelOption[] = [
  {
    id: 'anthropic/claude-3-5-sonnet-20241022',
    label: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Great at code generation and iterative fixes',
  },
  {
    id: 'openai/gpt-4o',
    label: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Fast, capable, strong all-round coder',
  },
  {
    id: 'anthropic/claude-3-5-haiku-20241022',
    label: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    description: 'Lightweight and quick for small edits',
  },
]

export const DEFAULT_MODEL_ID = AI_MODELS[0].id

export function isValidModel(id: string): boolean {
  return AI_MODELS.some((m) => m.id === id)
}
