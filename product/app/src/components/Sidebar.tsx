import type { ReactNode } from 'react'
import type { Agent, Conversation } from '../lib/supabase'
import { Glyph } from './Avatar'

export type WorkspaceSection = 'skills' | 'crons' | 'context' | 'agents' | 'settings'
export type View = { type: 'inbox' } | { type: 'conv'; id: string } | { type: 'section'; section: WorkspaceSection }

const I = ({ d }: { d: ReactNode }) => <svg className="i" viewBox="0 0 24 24">{d}</svg>

export const SECTIONS: { id: WorkspaceSection; label: string; blurb: string; icon: ReactNode }[] = [
  { id: 'agents', label: 'Agents', blurb: 'Who is in your study group', icon: <I d={<><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3" /></>} /> },
  { id: 'skills', label: 'Skills', blurb: 'Reusable workflows your agents can run', icon: <I d={<><path d="M12 3 4 7.5v9L12 21l8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>} /> },
  { id: 'context', label: 'Context', blurb: 'USER.md, SOUL.md and course files', icon: <I d={<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>} /> },
  { id: 'crons', label: 'Routines', blurb: 'Briefs and reminders on a schedule', icon: <I d={<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>} /> },
  { id: 'settings', label: 'Settings', blurb: 'Model, tutor mode, Canvas', icon: <I d={<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>} /> },
]

export const InboxIcon = <I d={<><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5.5 5h13L21 13v6H3v-6z" /></>} />
const Plus = <I d={<path d="M12 5v14M5 12h14" />} />

export const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

type Props = {
  view: View
  onView: (v: View) => void
  channels: Conversation[]
  dms: Conversation[]
  agentsById: Record<string, Agent>
  unread: Set<string>
  onCompose: (kind: 'group' | 'direct') => void
  onSearch: () => void
  theme: 'light' | 'dark'
  onTheme: () => void
}

export function Sidebar(p: Props) {
  const isConv = (id: string) => p.view.type === 'conv' && p.view.id === id
  const isSection = (s: WorkspaceSection) => p.view.type === 'section' && p.view.section === s
  return (
    <aside className="side">
      <div className="brand"><span className="mark" /><b>Homeroom</b><span className="term">FALL 26</span></div>
      <button className="search" onClick={p.onSearch}>
        <I d={<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>} />
        Jump to anything
        <kbd>⌘K</kbd>
      </button>

      <nav className="nav">
        <button className={p.view.type === 'inbox' ? 'on' : ''} onClick={() => p.onView({ type: 'inbox' })}>
          {InboxIcon}Inbox{p.unread.size > 0 && <span className="n live">{p.unread.size}</span>}
        </button>
        {SECTIONS.map((s) => (
          <button key={s.id} className={isSection(s.id) ? 'on' : ''} onClick={() => p.onView({ type: 'section', section: s.id })}>
            {s.icon}{s.label}
          </button>
        ))}
      </nav>

      <div className="scroller">
        <div className="sect">Channels<button aria-label="New channel" onClick={() => p.onCompose('group')}>{Plus}</button></div>
        <div className="list">
          {p.channels.map((c) => (
            <button key={c.id} className={`row ${isConv(c.id) ? 'on' : ''} ${p.unread.has(c.id) ? 'unread' : ''}`} onClick={() => p.onView({ type: 'conv', id: c.id })}>
              <span className="hash">#</span><span className="label">{slug(c.title)}</span>
              {p.unread.has(c.id) && !isConv(c.id) && <span className="dot" />}
            </button>
          ))}
          {p.channels.length === 0 && <p className="muted tiny pad-x">No channels yet.</p>}
        </div>

        <div className="sect">Direct messages<button aria-label="New message" onClick={() => p.onCompose('direct')}>{Plus}</button></div>
        <div className="list">
          {p.dms.map((c) => {
            const agent = p.agentsById[c.agentIds[0]]
            return (
              <button key={c.id} className={`row ${isConv(c.id) ? 'on' : ''} ${p.unread.has(c.id) ? 'unread' : ''}`} onClick={() => p.onView({ type: 'conv', id: c.id })}>
                <Glyph agent={agent} /><span className="label">{agent?.name ?? c.title}</span>
                <span className="status" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="me">
        <span className="me-av">You</span>
        <div className="who"><b>Student</b><span>Tutor mode · on</span></div>
        <button className="theme" onClick={p.onTheme} aria-label={`Switch to ${p.theme === 'dark' ? 'light' : 'dark'} mode`}>
          <I d={<><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" /></>} />
        </button>
      </div>
    </aside>
  )
}
