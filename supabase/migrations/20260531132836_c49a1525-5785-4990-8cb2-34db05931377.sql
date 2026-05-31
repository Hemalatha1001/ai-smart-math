
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  total_points int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- quiz_scores
create table public.quiz_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  difficulty text not null,
  score int not null,
  total int not null,
  best_streak int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert on public.quiz_scores to authenticated;
grant all on public.quiz_scores to service_role;
alter table public.quiz_scores enable row level security;
create policy "users read own quiz_scores" on public.quiz_scores for select to authenticated using (auth.uid() = user_id);
create policy "users insert own quiz_scores" on public.quiz_scores for insert to authenticated with check (auth.uid() = user_id);

-- bump points on new quiz_score
create or replace function public.bump_points()
returns trigger language plpgsql security definer set search_path = public as $$
declare bonus int;
begin
  bonus := new.score * (case new.difficulty when 'easy' then 1 when 'medium' then 2 when 'hard' then 3 else 1 end);
  update public.profiles set total_points = total_points + bonus where id = new.user_id;
  return new;
end;
$$;
create trigger on_quiz_score_insert
  after insert on public.quiz_scores
  for each row execute function public.bump_points();

-- history
create table public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  detail text,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.history to authenticated;
grant all on public.history to service_role;
alter table public.history enable row level security;
create policy "users read own history" on public.history for select to authenticated using (auth.uid() = user_id);
create policy "users insert own history" on public.history for insert to authenticated with check (auth.uid() = user_id);
create policy "users delete own history" on public.history for delete to authenticated using (auth.uid() = user_id);
