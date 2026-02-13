-- 사용하지 않는 회의실 편의시설 컬럼 제거
ALTER TABLE "rooms" DROP COLUMN IF EXISTS "amenities";
