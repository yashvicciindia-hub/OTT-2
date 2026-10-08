create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_path text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default extensions.gen_random_uuid(),
  content_type text not null check (content_type in ('video', 'podcast', 'story')),
  creator_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  description text not null default '',
  category text not null default '',
  thumbnail_path text,
  media_path text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_content_has_timestamp check (status <> 'published' or published_at is not null)
);

create index if not exists content_items_published_type_created_idx
  on public.content_items (content_type, published_at desc)
  where status = 'published';
create index if not exists content_items_creator_created_idx
  on public.content_items (creator_id, created_at desc);

create table if not exists public.live_events (
  id uuid primary key default extensions.gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  description text not null default '',
  category text not null default '',
  thumbnail_path text,
  stream_url text,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'live', 'ended', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_events_public_schedule_idx
  on public.live_events (scheduled_at)
  where status in ('scheduled', 'live');
create index if not exists live_events_creator_schedule_idx
  on public.live_events (creator_id, scheduled_at desc);

create table if not exists public.saved_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null references public.content_items (id) on delete cascade,
  position integer not null default 0,
  saved_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index if not exists saved_items_order_idx on public.saved_items (user_id, position, saved_at desc);

create table if not exists public.likes (
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null references public.content_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table if not exists public.user_activity (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null references public.content_items (id) on delete cascade,
  activity_type text not null check (activity_type in ('view', 'watch_progress')),
  progress_seconds integer not null default 0 check (progress_seconds >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, content_id, activity_type)
);

create index if not exists user_activity_recent_idx
  on public.user_activity (user_id, updated_at desc)
  where activity_type = 'view';
create index if not exists user_activity_progress_idx
  on public.user_activity (user_id, updated_at desc)
  where activity_type = 'watch_progress';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Lumera member'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists content_items_set_updated_at on public.content_items;
create trigger content_items_set_updated_at before update on public.content_items
  for each row execute function public.set_updated_at();
drop trigger if exists live_events_set_updated_at on public.live_events;
create trigger live_events_set_updated_at before update on public.live_events
  for each row execute function public.set_updated_at();
drop trigger if exists user_activity_set_updated_at on public.user_activity;
create trigger user_activity_set_updated_at before update on public.user_activity
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.live_events enable row level security;
alter table public.saved_items enable row level security;
alter table public.likes enable row level security;
alter table public.user_activity enable row level security;

create policy "Users can read their profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Users can create their profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "Users can update their profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Published content and own drafts are readable"
  on public.content_items for select to anon, authenticated
  using (status = 'published' or (select auth.uid()) = creator_id);
create policy "Users can create their own content"
  on public.content_items for insert to authenticated
  with check ((select auth.uid()) = creator_id);
create policy "Creators can update their own content"
  on public.content_items for update to authenticated
  using ((select auth.uid()) = creator_id)
  with check ((select auth.uid()) = creator_id);
create policy "Creators can delete their own content"
  on public.content_items for delete to authenticated
  using ((select auth.uid()) = creator_id);

create policy "Published and own live events are readable"
  on public.live_events for select to anon, authenticated
  using (
    status in ('scheduled', 'live')
    or (select auth.uid()) = creator_id
  );
create policy "Users can create their own live events"
  on public.live_events for insert to authenticated
  with check ((select auth.uid()) = creator_id);
create policy "Creators can update their own live events"
  on public.live_events for update to authenticated
  using ((select auth.uid()) = creator_id)
  with check ((select auth.uid()) = creator_id);
create policy "Creators can delete their own live events"
  on public.live_events for delete to authenticated
  using ((select auth.uid()) = creator_id);

create policy "Users can read their saved items"
  on public.saved_items for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can save their own items"
  on public.saved_items for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update their saved items"
  on public.saved_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can remove their saved items"
  on public.saved_items for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read their likes"
  on public.likes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can like content"
  on public.likes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can remove their likes"
  on public.likes for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read their activity"
  on public.user_activity for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can write their activity"
  on public.user_activity for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update their activity"
  on public.user_activity for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their activity"
  on public.user_activity for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.content_items to authenticated;
grant select on public.content_items to anon;
grant select, insert, update, delete on public.live_events to authenticated;
grant select on public.live_events to anon;
grant select, insert, update, delete on public.saved_items to authenticated;
grant select, insert, delete on public.likes to authenticated;
grant select, insert, update, delete on public.user_activity to authenticated;

create or replace view public.videos with (security_invoker = true) as
  select * from public.content_items where content_type = 'video';
create or replace view public.podcasts with (security_invoker = true) as
  select * from public.content_items where content_type = 'podcast';
create or replace view public.stories with (security_invoker = true) as
  select * from public.content_items where content_type = 'story';
create or replace view public.live_event_schedule with (security_invoker = true) as
  select * from public.live_events;

grant select on public.videos, public.podcasts, public.stories to anon, authenticated;
grant insert, update, delete on public.videos, public.podcasts, public.stories to authenticated;
grant select on public.live_event_schedule to anon, authenticated;

create or replace function public.search_published_content(
  search_query text,
  filter_types text[] default array['video', 'podcast', 'story']::text[]
)
returns setof public.content_items
language sql
stable
security invoker
set search_path = ''
as $$
  select content.*
  from public.content_items as content
  where content.status = 'published'
    and content.content_type = any(filter_types)
    and (
      nullif(trim(search_query), '') is null
      or position(lower(trim(search_query)) in lower(content.title)) > 0
      or position(lower(trim(search_query)) in lower(content.description)) > 0
      or position(lower(trim(search_query)) in lower(content.category)) > 0
    )
  order by content.published_at desc nulls last, content.created_at desc;
$$;

grant execute on function public.search_published_content(text, text[]) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('lumera-media', 'lumera-media', true, 1073741824, array['video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg']),
  ('lumera-thumbnails', 'lumera-thumbnails', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read Lumera media"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('lumera-media', 'lumera-thumbnails'));
create policy "Users can upload Lumera media to their folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('lumera-media', 'lumera-thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Users can update Lumera media in their folder"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('lumera-media', 'lumera-thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('lumera-media', 'lumera-thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Users can delete Lumera media in their folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('lumera-media', 'lumera-thumbnails')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
