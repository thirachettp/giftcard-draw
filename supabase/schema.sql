-- Giftcard: โครงสร้างฐานข้อมูลแบบหลายห้อง
-- วิธีใช้: Supabase > SQL Editor > วางทั้งไฟล์ > Run
-- (สำหรับโปรเจกต์ใหม่ ถ้าเคยรัน schema เวอร์ชันห้องเดียวไว้ ให้ลบตารางเก่าก่อน หรือสร้างโปรเจกต์ Supabase ใหม่)

create table if not exists public.rooms (
  id          text primary key check (id ~ '^[A-Z0-9]{4,12}$'),
  admin_hash  text not null,                        -- sha256 ของรหัสลับผู้จัดห้อง (ไม่เก็บรหัสจริง)
  title       text not null,
  id_label    text not null default 'รหัสพนักงาน',   -- ชื่อเรียกรหัสประจำตัวของห้องนี้
  phase       text not null default 'register' check (phase in ('register', 'drawn')),
  drawn_at    timestamptz,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '30 days')
);

-- หนึ่งแถวต่อหนึ่งคนต่อห้อง emp_id เก็บแบบตัวพิมพ์เล็กและตัดช่องว่างแล้ว
-- user_id คือเครื่อง/เบราว์เซอร์ที่ผูกอยู่ ผู้จัดรีเซ็ตแล้วจะเป็น null
create table if not exists public.players (
  room_id     text not null references public.rooms (id) on delete cascade,
  emp_id      text not null,
  emp_label   text not null,
  user_id     uuid,
  nick        text not null,
  gift_no     text not null,
  price       integer not null check (price >= 0),
  prompt      text not null,
  created_at  timestamptz not null default now(),
  primary key (room_id, emp_id)
);
create unique index if not exists players_room_user_uq on public.players (room_id, user_id) where user_id is not null;
create unique index if not exists players_room_gift_uq on public.players (room_id, lower(gift_no));

create table if not exists public.results (
  room_id       text not null,
  receiver_emp  text not null,
  giver_emp     text not null,
  gift_no       text not null,
  price         integer not null,
  prompt        text not null,
  tier          int not null check (tier between 0 and 2),
  opened_at     timestamptz,
  primary key (room_id, receiver_emp),
  foreign key (room_id, receiver_emp) references public.players (room_id, emp_id) on delete cascade,
  foreign key (room_id, giver_emp)    references public.players (room_id, emp_id) on delete cascade
);

-- รายการรหัสที่อนุญาตของแต่ละห้อง (ไม่บังคับ ถ้าว่างคือใครมีลิงก์ห้องก็ลงทะเบียนได้)
create table if not exists public.allowed_ids (
  room_id text not null references public.rooms (id) on delete cascade,
  emp_id  text not null,
  primary key (room_id, emp_id)
);

-- บันทึกการสร้างห้อง (เก็บเฉพาะแฮชของ IP) ไว้จำกัดจำนวนห้องต่อชั่วโมง
create table if not exists public.create_log (
  ip_hash text not null,
  at      timestamptz not null default now()
);
create index if not exists create_log_ip_at on public.create_log (ip_hash, at);

alter table public.rooms       enable row level security;
alter table public.players     enable row level security;
alter table public.results     enable row level security;
alter table public.allowed_ids enable row level security;
alter table public.create_log  enable row level security;

-- เขียนข้อมูลและอ่านข้อมูลห้องได้เฉพาะผ่าน API ฝั่งเซิร์ฟเวอร์ (service role)
-- ผู้เล่นอ่านได้เฉพาะแถวของตัวเอง ห้ามอ่านตาราง rooms ตรงๆ เพื่อไม่ให้ไล่ดูรายชื่อห้องทั้งหมด
revoke all on public.rooms, public.players, public.results, public.allowed_ids, public.create_log from anon, authenticated;

grant select on public.players to authenticated;
grant select on public.results to authenticated;
grant update (opened_at) on public.results to authenticated;

drop policy if exists players_own on public.players;
create policy players_own on public.players
  for select to authenticated using (user_id = auth.uid());

drop policy if exists results_own on public.results;
create policy results_own on public.results
  for select to authenticated
  using (exists (select 1 from public.players p
                 where p.room_id = results.room_id and p.emp_id = results.receiver_emp and p.user_id = auth.uid()));

drop policy if exists results_open on public.results;
create policy results_open on public.results
  for update to authenticated
  using (exists (select 1 from public.players p
                 where p.room_id = results.room_id and p.emp_id = results.receiver_emp and p.user_id = auth.uid()))
  with check (exists (select 1 from public.players p
                      where p.room_id = results.room_id and p.emp_id = results.receiver_emp and p.user_id = auth.uid()));

-- กองของขวัญของห้อง ไม่มีชื่อหรือรหัสเจ้าของ และเห็นได้เฉพาะคนที่ลงทะเบียนในห้องนั้นแล้ว
-- view นี้ตั้งใจให้ข้ามกฎรายแถว (Supabase อาจเตือนว่า Security Definer View ซึ่งเป็นเรื่องปกติของงานนี้)
create or replace view public.gift_pool as
  select p.room_id, p.gift_no, p.price, p.prompt, (p.user_id = auth.uid()) as mine
  from public.players p
  where exists (select 1 from public.players me
                where me.room_id = p.room_id and me.user_id = auth.uid());
revoke all on public.gift_pool from anon, authenticated;
grant select on public.gift_pool to authenticated;
