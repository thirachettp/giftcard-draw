-- เพิ่มโหมดเบอร์ของขวัญ (running = ระบบรันเลขให้, manual = ผู้เล่นกรอกเอง)
-- ใช้เมื่อรัน migrate-v3.sql / schema.sql เวอร์ชันก่อนหน้านี้ไปแล้ว (รันซ้ำได้ ไม่ลบข้อมูล)
alter table public.rooms add column if not exists number_mode text not null default 'running';
alter table public.rooms drop constraint if exists rooms_number_mode_check;
alter table public.rooms add constraint rooms_number_mode_check check (number_mode in ('running', 'manual'));
