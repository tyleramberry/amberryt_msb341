import { useEffect, useState, type ReactNode } from 'react'
import { supabase, type Agent, type ContextFile, type CronJob, type Settings, type Skill } from '../lib/supabase'
import { SECTIONS, type WorkspaceSection } from './Sidebar'
import { Avatar } from './Avatar'
import { formatStamp } from '../lib/time'

export function Workspace({ section, agents, onBack }: { section: WorkspaceSection; agents: Agent[]; onBack: () => void }) {
  const meta = SECTIONS.find((s) => s.id === section)!
  return (
    <section className="workspace">
      <header className="chat-header ws-header">
        <button className="back" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 12 20" width="12" height="20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="ws-title">
          <h2>{meta.label}</h2>
          <p className="muted small">{meta.blurb}</p>
        </div>
      </header>
      <div className="ws-body">
        {section === 'skills' && <Skills />}
        {section === 'crons' && <Crons />}
        {section === 'context' && <Context />}
        {section === 'agents' && <Agents agents={agents} />}
        {section === 'settings' && <SettingsPanel />}
      </div>
    </section>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={`switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>
      <span />
    </button>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>
}

function Skills() {
  const [items, setItems] = useState<Skill[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const load = () => supabase.from('skills').select('id, name, description, enabled').order('created_at').then(({ data }) => setItems(data ?? []))
  useEffect(() => { load() }, [])

  async function toggle(s: Skill, enabled: boolean) {
    setItems((all) => all.map((x) => (x.id === s.id ? { ...x, enabled } : x)))
    await supabase.from('skills').update({ enabled }).eq('id', s.id)
  }
  async function add() {
    if (!name.trim()) return
    await supabase.from('skills').insert({ name: name.trim(), description: description.trim() })
    setName(''); setDescription(''); load()
  }
  async function remove(id: string) {
    setItems((all) => all.filter((x) => x.id !== id))
    await supabase.from('skills').delete().eq('id', id)
  }

  return (
    <>
      <Card>
        {items.map((s) => (
          <div className="list-row" key={s.id}>
            <div className="row-text">
              <strong>{s.name}</strong>
              <span className="row-preview wrap">{s.description}</span>
            </div>
            <button className="link danger small" onClick={() => remove(s.id)}>Delete</button>
            <Toggle on={s.enabled} onChange={(v) => toggle(s, v)} label={`Enable ${s.name}`} />
          </div>
        ))}
        {items.length === 0 && <p className="muted pad">No skills yet.</p>}
      </Card>
      <h3 className="card-label">Add a skill</h3>
      <Card>
        <input className="field bare" placeholder="Name, e.g. Case write-up" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field bare" placeholder="What it does" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="card-actions"><button className="pill" disabled={!name.trim()} onClick={add}>Add skill</button></div>
      </Card>
    </>
  )
}

function Crons() {
  const [items, setItems] = useState<CronJob[]>([])
  const [name, setName] = useState('')
  const [schedule, setSchedule] = useState('')
  const [prompt, setPrompt] = useState('')

  const load = () => supabase.from('cron_jobs').select('id, name, schedule, prompt, enabled').order('created_at').then(({ data }) => setItems(data ?? []))
  useEffect(() => { load() }, [])

  async function toggle(c: CronJob, enabled: boolean) {
    setItems((all) => all.map((x) => (x.id === c.id ? { ...x, enabled } : x)))
    await supabase.from('cron_jobs').update({ enabled }).eq('id', c.id)
  }
  async function add() {
    if (!name.trim() || !schedule.trim()) return
    await supabase.from('cron_jobs').insert({ name: name.trim(), schedule: schedule.trim(), prompt: prompt.trim() })
    setName(''); setSchedule(''); setPrompt(''); load()
  }
  async function remove(id: string) {
    setItems((all) => all.filter((x) => x.id !== id))
    await supabase.from('cron_jobs').delete().eq('id', id)
  }

  return (
    <>
      <p className="muted small note">Schedules are saved but don't run yet. Crons are P1 (F6) in the PRD.</p>
      <Card>
        {items.map((c) => (
          <div className="list-row" key={c.id}>
            <div className="row-text">
              <strong>{c.name}</strong>
              <span className="badge">{c.schedule}</span>
              <span className="row-preview wrap">{c.prompt}</span>
            </div>
            <button className="link danger small" onClick={() => remove(c.id)}>Delete</button>
            <Toggle on={c.enabled} onChange={(v) => toggle(c, v)} label={`Enable ${c.name}`} />
          </div>
        ))}
        {items.length === 0 && <p className="muted pad">No cron jobs yet.</p>}
      </Card>
      <h3 className="card-label">Add a cron job</h3>
      <Card>
        <input className="field bare" placeholder="Name, e.g. Exam countdown" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field bare" placeholder="When, e.g. Weekdays · 8:00 AM" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
        <input className="field bare" placeholder="What the agent should do" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="card-actions"><button className="pill" disabled={!name.trim() || !schedule.trim()} onClick={add}>Add cron job</button></div>
      </Card>
    </>
  )
}

function Context() {
  const [files, setFiles] = useState<ContextFile[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [newPath, setNewPath] = useState('')

  const load = async (select?: string) => {
    const { data } = await supabase.from('context_files').select('id, path, content, updated_at').order('path')
    const list = data ?? []
    setFiles(list)
    const target = list.find((f) => f.id === (select ?? openId)) ?? list[0]
    if (target) { setOpenId(target.id); setText(target.content) }
  }
  useEffect(() => { load() }, [])

  const open = files.find((f) => f.id === openId)
  const dirty = open && text !== open.content

  async function save() {
    if (!open) return
    setStatus('saving')
    const updated_at = new Date().toISOString()
    await supabase.from('context_files').update({ content: text, updated_at }).eq('id', open.id)
    setFiles((all) => all.map((f) => (f.id === open.id ? { ...f, content: text, updated_at } : f)))
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 1500)
  }
  async function add() {
    const path = newPath.trim().replace(/^\/+/, '')
    if (!path) return
    const finalPath = path.endsWith('.md') ? path : `${path}.md`
    const { data } = await supabase.from('context_files').insert({ path: finalPath, content: `# ${finalPath}\n` }).select('id').single()
    setNewPath('')
    await load(data?.id)
  }

  return (
    <div className="context">
      <div className="file-tabs">
        {files.map((f) => (
          <button key={f.id} className={`file-tab ${f.id === openId ? 'on' : ''}`} onClick={() => { setOpenId(f.id); setText(f.content) }}>
            {f.path}
          </button>
        ))}
      </div>
      {open && (
        <Card>
          <textarea className="editor" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label={open.path} />
          <div className="card-actions spread">
            <span className="muted small">Edited {formatStamp(open.updated_at)}</span>
            <button className="pill" disabled={!dirty || status === 'saving'} onClick={save}>
              {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </Card>
      )}
      <h3 className="card-label">New file</h3>
      <Card>
        <input className="field bare" placeholder="e.g. rubrics/msb341-sprint-2.md" value={newPath} onChange={(e) => setNewPath(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <div className="card-actions"><button className="pill" disabled={!newPath.trim()} onClick={add}>Create file</button></div>
      </Card>
    </div>
  )
}

function Agents({ agents }: { agents: Agent[] }) {
  return (
    <Card>
      {agents.map((a) => (
        <div className="list-row" key={a.id}>
          <Avatar agent={a} size={40} />
          <div className="row-text">
            <strong>{a.name}</strong>
            <span className="row-preview wrap">{a.role}</span>
          </div>
        </div>
      ))}
      <p className="muted small pad">Agents reply with placeholder text for now. Real model replies arrive with the harness core (decision 004).</p>
    </Card>
  )
}

function SettingsPanel() {
  const [s, setS] = useState<Settings | null>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    supabase.from('settings').select('*').single().then(({ data }) => { setS(data); setName(data?.display_name ?? '') })
  }, [])

  async function patch(p: Partial<Settings>) {
    if (!s) return
    setS({ ...s, ...p })
    await supabase.from('settings').update(p).eq('user_id', s.user_id)
  }

  if (!s) return <p className="muted pad">Loading…</p>
  return (
    <>
      <Card>
        <label className="list-row">
          <span className="row-text"><strong>Your name</strong></span>
          <input className="field inline" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name !== s.display_name && patch({ display_name: name.trim() })} />
        </label>
        <div className="list-row">
          <span className="row-text">
            <strong>Tutor mode</strong>
            <span className="row-preview wrap">Agents teach and ask questions instead of writing answers.</span>
          </span>
          <Toggle on={s.tutor_mode} onChange={(v) => patch({ tutor_mode: v })} label="Tutor mode" />
        </div>
        <label className="list-row">
          <span className="row-text"><strong>Model</strong></span>
          <select className="field inline" value={s.model} onChange={(e) => patch({ model: e.target.value })}>
            <option value="claude-haiku-4-5">Claude Haiku 4.5 (fast)</option>
            <option value="claude-sonnet-5-5">Claude Sonnet 5.5</option>
            <option value="claude-opus-5-5">Claude Opus 5.5</option>
          </select>
        </label>
      </Card>
      <h3 className="card-label">Connections</h3>
      <Card>
        <div className="list-row">
          <span className="row-text">
            <strong>Canvas</strong>
            <span className="row-preview wrap">Read-only import of courses, due dates and rubrics (F1). Coming in Sprint 3.</span>
          </span>
          <button className="pill" disabled>Connect</button>
        </div>
      </Card>
      <p className="muted small note">You're using a guest session tied to this browser. Clearing site data starts a fresh workspace.</p>
    </>
  )
}
