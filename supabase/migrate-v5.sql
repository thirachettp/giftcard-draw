-- โหมดเฉลย: names = เห็นแค่ว่าใครได้ของใคร, gifts = เห็นด้วยว่าของขวัญที่จับได้คืออะไร
-- รันซ้ำได้ ไม่ลบข้อมูล
alter table public.rooms add column if not exists reveal_mode text not null default 'names';
alter table public.rooms drop constraint if exists rooms_reveal_mode_check;
alter table public.rooms add constraint rooms_reveal_mode_check check (reveal_mode in ('names', 'gifts'));
