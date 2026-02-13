-- 예약 외부 참석자 저장 컬럼
ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "external_participants" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
