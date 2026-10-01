import type { Agent } from '../lib/supabase'

// Monochrome geometric marks instead of emoji: one shape per agent.
const SHAPES: Record<string, string> = { tutor: 'tutor', rubric: 'rubric', planner: 'planner', researcher: 'research' }

export function Glyph({ agent, size = 'sm' }: { agent?: Agent; size?: 'sm' | 'lg' }) {
  const shape = (agent && SHAPES[agent.id]) ?? 'tutor'
  return <span className={`g ${shape} ${size === 'lg' ? 'lg' : ''}`} title={agent?.name} aria-hidden />
}

// Kept for Workspace / NewChat call sites.
export function Avatar({ agent, size = 40 }: { agent?: Agent; size?: number }) {
  return <Glyph agent={agent} size={size >= 24 ? 'lg' : 'sm'} />
}

export function GlyphStack({ agents }: { agents: Agent[] }) {
  return (
    <span className="stack">
      {agents.slice(0, 3).map((a) => <Glyph key={a.id} agent={a} />)}
    </span>
  )
}
