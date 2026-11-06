-- รันครั้งเดียวจบ: เพิ่มคอลัมน์ number_mode และ reveal_mode (รันซ้ำได้ ไม่ลบข้อมูล)
alter table public.rooms add column if not exists number_mode text not null default 'running';
alter table public.rooms drop constraint if exists rooms_number_mode_check;
alter table public.rooms add constraint rooms_number_mode_check check (number_mode in ('running', 'manual'));
alter table public.rooms add column if not exists reveal_mode text not null default 'names';
alter table public.rooms drop constraint if exists rooms_reveal_mode_check;
alter table public.rooms add constraint rooms_reveal_mode_check check (reveal_mode in ('names', 'gifts'));
