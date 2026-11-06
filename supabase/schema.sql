-- Giftcard: โครงสร้างฐานข้อมูลแบบหลายห้อง (เวอร์ชัน 3: ไม่มีรหัสพนักงาน ราคา หรือระดับการ์ด)
-- วิธีใช้: Supabase > SQL Editor > วางทั้งไฟล์ > Run
-- ถ้าเคยรันเวอร์ชันเก่าไว้แล้ว ให้รัน supabase/migrate-v3.sql แทน (จะล้างข้อมูลห้องเก่า)

create table if not exists public.rooms (
  id          text primary key check (id ~ '^[A-Z0-9]{4,12}$'),
  admin_hash  text not null,
  title       text not null,
  phase       text not null default 'register' check (phase in ('register', 'drawn')),
  number_mode text not null default 'running' check (number_mode in ('running', 'manual')),
  drawn_at    timestamptz,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '30 days')
);

-- หนึ่งแถวต่อหนึ่งคน/ของขวัญ user_id คือเครื่องที่ผูกอยู่ (ผู้จัดกด "ปลดเครื่อง" แล้วเป็น null)
create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  room_id     text not null references public.rooms (id) on delete cascade,
  user_id     uuid,
  nick        text not null,
  gift_no     integer not null,
  gift_text   text not null default '',
  unspecified boolean not null default false,
  icon        text not null default 'box',
  created_at  timestamptz not null default now()
);
create unique index if not exists players_room_user_uq on public.players (room_id, user_id) where user_id is not null;
create unique index if not exists players_room_gift_uq on public.players (room_id, gift_no);
create unique index if not exists players_room_nick_uq on public.players (room_id, lower(nick));

create table if not exists public.results (
  room_id       text not null,
  receiver_id   uuid not null references public.players (id) on delete cascade,
  giver_id      uuid not null references public.players (id) on delete cascade,
  gift_no       integer not null,
  gift_text     text not null default '',
  unspecified   boolean not null default false,
  icon          text not null default 'box',
  opened_at     timestamptz,
  primary key (room_id, receiver_id)
);

create table if not exists public.create_log (
  ip_hash text not null,
  at      timestamptz not null default now()
);
create index if not exists create_log_ip_at on public.create_log (ip_hash, at);

-- ตัวนับจำนวนห้องที่เคยสร้างทั้งหมด (ไม่ลดลงเมื่อห้องหมดอายุ)
create table if not exists public.app_stats (
  key text primary key,
  n   bigint not null default 0
);
insert into public.app_stats (key, n) values ('rooms_created', (select count(*) from public.rooms))
  on conflict (key) do nothing;

create or replace function public.bump_rooms_created() returns bigint
language sql security definer set search_path = public as $$
  insert into public.app_stats (key, n) values ('rooms_created', 1)
  on conflict (key) do update set n = public.app_stats.n + 1
  returning n;
$$;
revoke all on function public.bump_rooms_created() from public, anon, authenticated;

alter table public.rooms      enable row level security;
alter table public.players    enable row level security;
alter table public.results    enable row level security;
alter table public.create_log enable row level security;
alter table public.app_stats  enable row level security;

-- ข้อมูลห้องและรายชื่ออ่านผ่าน API ฝั่งเซิร์ฟเวอร์เท่านั้น ผู้เล่นอ่านได้เฉพาะแถวของตัวเอง
revoke all on public.rooms, public.players, public.results, public.create_log, public.app_stats from anon, authenticated;

grant select on public.players to authenticated;
grant select on public.results to authenticated;
grant update (opened_at) on public.results to authenticated;

drop policy if exists players_own on public.players;
create policy players_own on public.players
  for select to authenticated using (user_id = auth.uid());

drop policy if exists results_own on public.results;
create policy results_own on public.results
  for select to authenticated
  using (exists (select 1 from public.players p where p.id = results.receiver_id and p.user_id = auth.uid()));

drop policy if exists results_open on public.results;
create policy results_open on public.results
  for update to authenticated
  using (exists (select 1 from public.players p where p.id = results.receiver_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.players p where p.id = results.receiver_id and p.user_id = auth.uid()));
