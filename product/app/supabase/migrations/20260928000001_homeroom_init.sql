-- Homeroom v0: conversations with agents + a student workspace.
-- Every row belongs to the signed-in (anonymous for now) user via RLS.

-- Agents are shared personas. Real model calls come later (decision 003);
-- for now each agent answers with a canned reply in its own voice.
create table public.agents (
  id text primary key,
  name text not null,
  emoji text not null,
  color text not null,
  role text not null,
  placeholder_reply text not null,
  sort int not null default 0
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('group', 'direct')),
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_agents (
  conversation_id uuid not null references public.conversations on delete cascade,
  agent_id text not null references public.agents,
  primary key (conversation_id, agent_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  sender text not null check (sender in ('user', 'agent')),
  agent_id text references public.agents,
  body text not null check (length(body) between 1 and 8000),
  created_at timestamptz not null default clock_timestamp()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index conversations_user_idx on public.conversations (user_id, updated_at desc);

-- Workspace (mirrors the markdown workspace in specs/mvpspec.md)
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  description text not null default '',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cron_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  schedule text not null,
  prompt text not null default '',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.context_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  path text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, path)
);

create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  display_name text not null default 'Student',
  tutor_mode boolean not null default true,
  model text not null default 'claude-sonnet-5-5',
  canvas_connected boolean not null default false
);

create index conversation_agents_agent_idx on public.conversation_agents (agent_id);
create index messages_agent_idx on public.messages (agent_id);
create index messages_user_idx on public.messages (user_id);
create index skills_user_idx on public.skills (user_id);
create index cron_jobs_user_idx on public.cron_jobs (user_id);

-- RLS
alter table public.agents enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_agents enable row level security;
alter table public.messages enable row level security;
alter table public.skills enable row level security;
alter table public.cron_jobs enable row level security;
alter table public.context_files enable row level security;
alter table public.settings enable row level security;

create policy "agents readable" on public.agents for select to authenticated using (true);

create policy "own conversations" on public.conversations for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own conversation agents" on public.conversation_agents for all to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

create policy "read own messages" on public.messages for select to authenticated
  using ((select auth.uid()) = user_id);
-- Users may only insert their own 'user' messages; agent replies come from the trigger.
create policy "send own messages" on public.messages for insert to authenticated
  with check ((select auth.uid()) = user_id and sender = 'user' and agent_id is null
    and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

create policy "own skills" on public.skills for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own cron jobs" on public.cron_jobs for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own context files" on public.context_files for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own settings" on public.settings for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Placeholder agent replies: after a user message, every agent in the thread answers.
-- Swap this for an Edge Function calling the model once the harness core is chosen.
create function public.placeholder_agent_replies() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.messages (conversation_id, user_id, sender, agent_id, body)
  select new.conversation_id, new.user_id, 'agent', a.id, a.placeholder_reply
  from public.conversation_agents ca
  join public.agents a on a.id = ca.agent_id
  where ca.conversation_id = new.conversation_id
  order by a.sort;

  update public.conversations set updated_at = now() where id = new.conversation_id;
  return null;
end $$;
revoke execute on function public.placeholder_agent_replies() from public, anon, authenticated;

create trigger on_user_message after insert on public.messages
  for each row when (new.sender = 'user')
  execute function public.placeholder_agent_replies();

-- Starter workspace for every new (anonymous) student.
create function public.seed_student_workspace() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  study_group uuid;
  tutor_chat uuid;
begin
  insert into public.settings (user_id) values (new.id);

  insert into public.conversations (user_id, kind, title) values (new.id, 'group', 'MSB 341 Study Group')
    returning id into study_group;
  insert into public.conversation_agents (conversation_id, agent_id)
    values (study_group, 'tutor'), (study_group, 'rubric'), (study_group, 'planner');
  insert into public.messages (conversation_id, user_id, sender, agent_id, body) values
    (study_group, new.id, 'agent', 'planner', 'Welcome to Homeroom 👋 This is your study group — Tutor, Rubric Checker and I all see what you send here.'),
    (study_group, new.id, 'agent', 'tutor', 'Tell us which assignment you''re working on and we''ll take it from there.');

  insert into public.conversations (user_id, kind, title) values (new.id, 'direct', 'Tutor')
    returning id into tutor_chat;
  insert into public.conversation_agents (conversation_id, agent_id) values (tutor_chat, 'tutor');
  insert into public.messages (conversation_id, user_id, sender, agent_id, body) values
    (tutor_chat, new.id, 'agent', 'tutor', 'Hi! I''m your tutor. I''ll explain and ask questions — I won''t write the answer for you.');

  insert into public.skills (user_id, name, description) values
    (new.id, 'Rubric check', 'Score a pasted draft against the assignment rubric, criterion by criterion.'),
    (new.id, 'Explain it back', 'Ask the student to explain a concept in their own words, then fill gaps.'),
    (new.id, 'Lab report outline', 'Build an outline from the course''s lab report template.');

  insert into public.cron_jobs (user_id, name, schedule, prompt, enabled) values
    (new.id, 'Daily brief', 'Every day · 7:00 AM', 'What is due in the next 3 days and what to work on first.', true),
    (new.id, 'Deadline reminder', '24h before each due date', 'Remind me of the assignment and its rubric.', true),
    (new.id, 'Weekly review', 'Sundays · 6:00 PM', 'Summarize the week and plan the next one.', false);

  insert into public.context_files (user_id, path, content) values
    (new.id, 'USER.md', E'# About me\n\n- Major: \n- Courses this term: \n- How I like to learn: '),
    (new.id, 'SOUL.md', E'# Tutor persona\n\nTeach, ask checking questions, and push back.\nNever write graded work or submit anything for the student.'),
    (new.id, 'courses/msb341.md', E'# MSB 341 — Product Management\n\n_Connect Canvas to fill in assignments, due dates and weights._');

  return new;
end $$;
revoke execute on function public.seed_student_workspace() from public, anon, authenticated;

create trigger on_student_created after insert on auth.users
  for each row execute function public.seed_student_workspace();

insert into public.agents (id, name, emoji, color, role, placeholder_reply, sort) values
  ('tutor', 'Tutor', '🧑‍🏫', '#34C759', 'Explains and asks checking questions — never hands over the answer.',
   'Good question. Before I explain — what do you think the first step is? (Placeholder: real tutoring comes once the model is wired up.)', 1),
  ('rubric', 'Rubric Checker', '✅', '#FF9500', 'Scores drafts against the rubric, criterion by criterion.',
   'Paste your draft and I''ll score it against the rubric. (Placeholder reply — rubric checks ship in F4.)', 2),
  ('planner', 'Planner', '📅', '#AF52DE', 'Knows your deadlines and what to work on first.',
   'Noted. Once Canvas is connected I''ll line this up against your due dates. (Placeholder reply.)', 3),
  ('researcher', 'Researcher', '🔎', '#007AFF', 'Finds and summarizes sources for an assignment.',
   'I''ll dig into sources for that. (Placeholder reply — research tools come later.)', 4);
