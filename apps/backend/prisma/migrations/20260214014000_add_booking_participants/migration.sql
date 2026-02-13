-- 예약 참석자 저장용 조인 테이블
CREATE TABLE "booking_participants" (
  "id" TEXT NOT NULL,
  "booking_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id")
);

-- 한 예약에 같은 사용자가 중복 참석자로 들어가지 않도록 제한
CREATE UNIQUE INDEX "booking_participants_booking_id_user_id_key"
  ON "booking_participants"("booking_id", "user_id");

CREATE INDEX "booking_participants_booking_id_idx"
  ON "booking_participants"("booking_id");

CREATE INDEX "booking_participants_user_id_idx"
  ON "booking_participants"("user_id");

ALTER TABLE "booking_participants"
  ADD CONSTRAINT "booking_participants_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "booking_participants"
  ADD CONSTRAINT "booking_participants_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
