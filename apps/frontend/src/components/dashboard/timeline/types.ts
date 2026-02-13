/** 예약 종류: 내 예약 | 참여 회의 | 다른 회의 */
export type BookingKind = 'mine' | 'included' | 'other';

/** 예약 생성/수정 폼 데이터 */
export interface BookingDraft {
  roomId: string;
  roomName: string;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  participants: string[];
  participantQuery: string;
}

/** 예약 수정용 폼 데이터 (id 포함) */
export interface EditBookingDraft extends BookingDraft {
  id: string;
}

/** 타임라인 예약 데이터 */
export interface Booking {
  id: string;
  title: string;
  roomName: string;
  startAt: string;
  endAt: string;
  reserverName: string;
  participantNames: string[];
  attendees: number;
  status: 'CONFIRMED' | 'CANCELLED';
  kind?: BookingKind;
}
