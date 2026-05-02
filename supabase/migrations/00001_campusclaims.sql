-- CampusClaims schema for self-hosted Supabase.
-- Run with: docker compose exec -T db psql -U postgres -d postgres < migrations/00001_campusclaims.sql

begin;

-- Required extensions (must be created before any indexes that depend on them)
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- =====================================================================
-- USERS (public profile data; mirrors auth.users 1:1)
-- =====================================================================
create table if not exists public.users (
    id        uuid primary key references auth.users(id) on delete cascade,
    email     text not null,
    username  text not null unique,
    created_at timestamptz not null default now()
);

create index if not exists users_username_idx on public.users (lower(username));

-- =====================================================================
-- POSTS
-- =====================================================================
do $$ begin
    create type public.post_type as enum ('lost', 'found');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.campus_code as enum ('TMU', 'UTM');
exception when duplicate_object then null; end $$;

create table if not exists public.posts (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    post_type   public.post_type   not null,
    campus      public.campus_code not null,
    title       text not null,
    description text,
    location    text,
    event_date  date,
    images      text[] not null default '{}',
    created_at  timestamptz not null default now()
);

create index if not exists posts_user_id_idx     on public.posts (user_id);
create index if not exists posts_campus_idx      on public.posts (campus);
create index if not exists posts_post_type_idx   on public.posts (post_type);
create index if not exists posts_title_trgm_idx  on public.posts using gin (title gin_trgm_ops);

-- =====================================================================
-- CONVERSATIONS (between two users)
-- =====================================================================
create table if not exists public.conversations (
    id              uuid primary key default gen_random_uuid(),
    user1_id        uuid not null references auth.users(id) on delete cascade,
    user2_id        uuid not null references auth.users(id) on delete cascade,
    last_message_at timestamptz,
    created_at      timestamptz not null default now(),
    constraint conversations_distinct_users check (user1_id <> user2_id)
);

create unique index if not exists conversations_unique_pair_idx
    on public.conversations (least(user1_id, user2_id), greatest(user1_id, user2_id));
create index if not exists conversations_user1_idx on public.conversations (user1_id);
create index if not exists conversations_user2_idx on public.conversations (user2_id);
create index if not exists conversations_last_msg_idx on public.conversations (last_message_at desc nulls last);

-- =====================================================================
-- MESSAGES
-- =====================================================================
create table if not exists public.messages (
    id              bigserial primary key,
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    sender_id       uuid not null references auth.users(id) on delete cascade,
    content         text not null check (length(trim(content)) > 0),
    created_at      timestamptz not null default now()
);

create index if not exists messages_convo_idx on public.messages (conversation_id, created_at);
create index if not exists messages_sender_idx on public.messages (sender_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.users         enable row level security;
alter table public.posts         enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- USERS policies
drop policy if exists "users readable by authenticated"          on public.users;
drop policy if exists "users insert own profile"                  on public.users;
drop policy if exists "users update own profile"                  on public.users;

create policy "users readable by authenticated" on public.users
    for select using (auth.role() = 'authenticated' or auth.role() = 'anon');

create policy "users insert own profile" on public.users
    for insert with check (auth.uid() = id);

create policy "users update own profile" on public.users
    for update using (auth.uid() = id) with check (auth.uid() = id);

-- POSTS policies (browsing is public; mutations are owner-only)
drop policy if exists "posts public read"   on public.posts;
drop policy if exists "posts insert own"    on public.posts;
drop policy if exists "posts update own"    on public.posts;
drop policy if exists "posts delete own"    on public.posts;

create policy "posts public read" on public.posts
    for select using (true);

create policy "posts insert own" on public.posts
    for insert with check (auth.uid() = user_id);

create policy "posts update own" on public.posts
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "posts delete own" on public.posts
    for delete using (auth.uid() = user_id);

-- CONVERSATIONS policies (only participants can see/touch)
drop policy if exists "conv read participant"   on public.conversations;
drop policy if exists "conv insert as user"     on public.conversations;
drop policy if exists "conv update participant" on public.conversations;

create policy "conv read participant" on public.conversations
    for select using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "conv insert as user" on public.conversations
    for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "conv update participant" on public.conversations
    for update using (auth.uid() = user1_id or auth.uid() = user2_id)
              with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- MESSAGES policies (only members of the conversation)
drop policy if exists "msg read participant"   on public.messages;
drop policy if exists "msg insert participant" on public.messages;

create policy "msg read participant" on public.messages
    for select using (
        exists (
            select 1 from public.conversations c
            where c.id = conversation_id
              and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
        )
    );

create policy "msg insert participant" on public.messages
    for insert with check (
        auth.uid() = sender_id
        and exists (
            select 1 from public.conversations c
            where c.id = conversation_id
              and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
        )
    );

-- =====================================================================
-- REALTIME (publish messages so subscriptions work)
-- =====================================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

-- =====================================================================
-- STORAGE: images bucket (public read, owner write)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images public read"     on storage.objects;
drop policy if exists "images authed insert"   on storage.objects;
drop policy if exists "images owner update"    on storage.objects;
drop policy if exists "images owner delete"    on storage.objects;

create policy "images public read" on storage.objects
    for select using (bucket_id = 'images');

create policy "images authed insert" on storage.objects
    for insert with check (
        bucket_id = 'images'
        and auth.role() = 'authenticated'
    );

create policy "images owner update" on storage.objects
    for update using (
        bucket_id = 'images' and auth.uid() = owner
    );

create policy "images owner delete" on storage.objects
    for delete using (
        bucket_id = 'images' and auth.uid() = owner
    );

commit;
