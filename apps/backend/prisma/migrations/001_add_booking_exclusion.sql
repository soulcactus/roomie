-- PostgreSQL EXCLUDE 제약을 위한 btree_gist 확장 설치
-- 이 확장은 GiST 인덱스에서 btree 연산자를 사용할 수 있게 함
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 예약 시간 중복 방지를 위한 EXCLUDE 제약
--
-- 설계 의도:
-- 1. 같은 회의실(room_id)에서 시간 범위가 겹치는 예약을 DB 레벨에서 차단
-- 2. 애플리케이션의 race condition과 무관하게 데이터 무결성 보장
-- 3. 취소된 예약(status = 'CANCELLED')은 충돌 검사에서 제외
--
-- tsrange 옵션:
-- - '[)' : 시작 시간 포함, 종료 시간 미포함 (10:00~11:00과 11:00~12:00은 충돌 X)
--
-- 위반 시 PostgreSQL 에러 코드: 23P01 (exclusion_violation)

ALTER TABLE bookings
ADD CONSTRAINT booking_no_overlap
EXCLUDE USING gist (
  room_id WITH =,
  tsrange(start_at, end_at, '[)') WITH &&
)
WHERE (status != 'CANCELLED');

-- 추가 인덱스: 특정 회의실의 특정 날짜 예약 조회 최적화
CREATE INDEX IF NOT EXISTS idx_bookings_room_date
ON bookings (room_id, start_at, end_at)
WHERE status != 'CANCELLED';

COMMENT ON CONSTRAINT booking_no_overlap ON bookings IS
'같은 회의실에서 시간이 겹치는 예약을 DB 레벨에서 방지. 취소된 예약은 제외.';
