-- Repoint posts.user_id FK from auth.users -> public.users so PostgREST can
-- resolve the embedded `user:user_id(...)` join used on the post detail page.
-- Safe: every posts.user_id has a matching public.users row (created by the
-- on_auth_user_created trigger), and public.users.id itself cascades from
-- auth.users, so delete-cascade behaviour is unchanged.
-- Run with: paste into the Supabase SQL Editor and Run.

begin;

alter table public.posts drop constraint if exists posts_user_id_fkey;

alter table public.posts
    add constraint posts_user_id_fkey
    foreign key (user_id) references public.users(id) on delete cascade;

commit;
