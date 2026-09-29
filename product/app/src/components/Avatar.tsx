import type { Agent } from '../lib/supabase'

export function Avatar({ agent, size = 40 }: { agent?: Agent; size?: number }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.5, background: agent ? `${agent.color}26` : undefined }}
      title={agent?.name}
    >
      {agent?.emoji ?? '?'}
    </span>
  )
}

// iMessage-style group avatar: up to three small circles clustered together.
export function GroupAvatar({ agents, size = 44 }: { agents: Agent[]; size?: number }) {
  if (agents.length <= 1) return <Avatar agent={agents[0]} size={size} />
  const small = Math.round(size * 0.58)
  return (
    <span className="group-avatar" style={{ width: size, height: size }}>
      {agents.slice(0, 3).map((a, i) => (
        <span key={a.id} className={`group-avatar-item pos-${i}`}>
          <Avatar agent={a} size={small} />
        </span>
      ))}
    </span>
  )
}
