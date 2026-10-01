import { useState } from 'react'
import { supabase, type Agent, type Conversation } from '../lib/supabase'
import { Avatar } from './Avatar'

type Props = {
  kind: 'group' | 'direct'
  agents: Agent[]
  onClose: () => void
  onCreated: (c: Conversation) => void
}

export function NewChat({ kind, agents, onClose, onCreated }: Props) {
  const [picked, setPicked] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isGroup = kind === 'group'
  const valid = isGroup ? picked.length >= 1 && title.trim().length > 0 : picked.length === 1

  function toggle(id: string) {
    setPicked((p) => (isGroup ? (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]) : [id]))
  }

  async function create() {
    if (!valid || busy) return
    setBusy(true)
    const names = picked.map((id) => agents.find((a) => a.id === id)!.name)
    const finalTitle = title.trim() || (isGroup ? names.join(', ') : names[0])
    const { data: conv, error } = await supabase.from('conversations').insert({ kind, title: finalTitle }).select('id, kind, title, updated_at').single()
    if (error || !conv) { setError(error?.message ?? 'Could not create chat'); setBusy(false); return }
    const { error: e2 } = await supabase.from('conversation_agents').insert(picked.map((agent_id) => ({ conversation_id: conv.id, agent_id })))
    if (e2) { setError(e2.message); setBusy(false); return }
    onCreated({ ...conv, agentIds: picked })
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={isGroup ? 'New channel' : 'New message'} onClick={(e) => e.stopPropagation()}>
        <header className="sheet-header">
          <button className="link" onClick={onClose}>Cancel</button>
          <strong>{isGroup ? 'New channel' : 'New message'}</strong>
          <button className="link bold" disabled={!valid || busy} onClick={create}>Create</button>
        </header>
        {isGroup && (
          <input className="field" placeholder="channel-name" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
        )}
        <p className="muted small">{isGroup ? 'Name it, then pick who answers in it.' : 'Pick an agent to message.'}</p>
        <div className="agent-picker">
          {agents.map((a) => (
            <button key={a.id} className={`agent-option ${picked.includes(a.id) ? 'on' : ''}`} onClick={() => toggle(a.id)}>
              <Avatar agent={a} size={36} />
              <span className="row-text">
                <strong>{a.name}</strong>
                <span className="row-preview">{a.role}</span>
              </span>
              <span className="check" aria-hidden>{picked.includes(a.id) ? '✓' : ''}</span>
            </button>
          ))}
        </div>
        {error && <p className="send-error">{error}</p>}
      </div>
    </div>
  )
}
