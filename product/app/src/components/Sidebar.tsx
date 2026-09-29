import type { Agent, Conversation } from '../lib/supabase'
import { GroupAvatar } from './Avatar'
import { formatListTime } from '../lib/time'

export type Tab = 'group' | 'direct' | 'workspace'
export type WorkspaceSection = 'skills' | 'crons' | 'context' | 'agents' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'group', label: 'Groups' },
  { id: 'direct', label: 'Chats' },
  { id: 'workspace', label: 'Workspace' },
]

export const SECTIONS: { id: WorkspaceSection; label: string; icon: string; blurb: string }[] = [
  { id: 'skills', label: 'Skills', icon: '🧩', blurb: 'Reusable workflows your agents can run' },
  { id: 'crons', label: 'Cron jobs', icon: '⏰', blurb: 'Briefs and reminders on a schedule' },
  { id: 'context', label: 'Context', icon: '📄', blurb: 'USER.md, SOUL.md and course files' },
  { id: 'agents', label: 'Agents', icon: '🤖', blurb: 'Who is in your study group' },
  { id: 'settings', label: 'Settings', icon: '⚙️', blurb: 'Model, tutor mode, Canvas' },
]

type Props = {
  tab: Tab
  onTab: (t: Tab) => void
  conversations: Conversation[]
  agentsById: Record<string, Agent>
  selectedId: string | null
  onSelect: (id: string) => void
  section: WorkspaceSection
  onSection: (s: WorkspaceSection) => void
  onCompose: () => void
}

export function Sidebar(p: Props) {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="sidebar-title-row">
          <h1>Homeroom</h1>
          {p.tab !== 'workspace' && (
            <button className="icon-btn" onClick={p.onCompose} aria-label={p.tab === 'group' ? 'New group chat' : 'New chat'}>
              <svg viewBox="0 0 24 24" width="22" height="22"><path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            </button>
          )}
        </div>
        <div className="segmented" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={p.tab === t.id} className={p.tab === t.id ? 'on' : ''} onClick={() => p.onTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <nav className="sidebar-list">
        {p.tab === 'workspace'
          ? SECTIONS.map((s) => (
              <button key={s.id} className={`row ${p.section === s.id ? 'selected' : ''}`} onClick={() => p.onSection(s.id)}>
                <span className="section-icon">{s.icon}</span>
                <span className="row-text">
                  <span className="row-top"><strong>{s.label}</strong></span>
                  <span className="row-preview">{s.blurb}</span>
                </span>
              </button>
            ))
          : p.conversations.map((c) => {
              const agents = c.agentIds.map((id) => p.agentsById[id]).filter(Boolean).sort((a, b) => a.sort - b.sort)
              return (
                <button key={c.id} className={`row ${p.selectedId === c.id ? 'selected' : ''}`} onClick={() => p.onSelect(c.id)}>
                  <GroupAvatar agents={agents} />
                  <span className="row-text">
                    <span className="row-top">
                      <strong>{c.title}</strong>
                      <time>{c.last ? formatListTime(c.last.created_at) : ''}</time>
                    </span>
                    <span className="row-preview">{c.last?.body ?? agents.map((a) => a.name).join(', ')}</span>
                  </span>
                </button>
              )
            })}
        {p.tab !== 'workspace' && p.conversations.length === 0 && (
          <p className="muted pad">Nothing here yet. Tap the pencil to start.</p>
        )}
      </nav>
    </aside>
  )
}
