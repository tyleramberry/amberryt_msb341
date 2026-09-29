import { createClient } from '@supabase/supabase-js'

// Publishable key: safe in the browser, access is enforced by row-level security.
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://xwmlglizgmvvvpxkltjy.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_eUsvC8x7AeGNMyvaiDbNLQ_T5AxGI4x'

export const supabase = createClient(url, key)

export type Agent = {
  id: string
  name: string
  emoji: string
  color: string
  role: string
  sort: number
}

export type Conversation = {
  id: string
  kind: 'group' | 'direct'
  title: string
  updated_at: string
  agentIds: string[]
  last?: { body: string; created_at: string }
}

export type Message = {
  id: string
  conversation_id: string
  sender: 'user' | 'agent'
  agent_id: string | null
  body: string
  created_at: string
}

export type Skill = { id: string; name: string; description: string; enabled: boolean }
export type CronJob = { id: string; name: string; schedule: string; prompt: string; enabled: boolean }
export type ContextFile = { id: string; path: string; content: string; updated_at: string }
export type Settings = {
  user_id: string
  display_name: string
  tutor_mode: boolean
  model: string
  canvas_connected: boolean
}

export async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session
  const { data: signedIn, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return signedIn.session
}

export async function loadConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, kind, title, updated_at, conversation_agents(agent_id), messages(body, created_at)')
    .order('updated_at', { ascending: false })
    .order('created_at', { referencedTable: 'messages', ascending: false })
    .limit(1, { referencedTable: 'messages' })
  if (error) throw error
  return data.map((c) => ({
    id: c.id,
    kind: c.kind,
    title: c.title,
    updated_at: c.updated_at,
    agentIds: c.conversation_agents.map((a) => a.agent_id),
    last: c.messages[0],
  }))
}
