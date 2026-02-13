export type SeedUserRole = 'USER' | 'ADMIN';

export interface SeedUser {
  name: string;
  email: string;
  role: SeedUserRole;
}

export interface SeedRoom {
  id: string;
  name: string;
  location: string;
  capacity: number;
  isAvailable: boolean;
  nextBookingTime?: string;
}

export interface SeedBooking {
  id: string;
  title: string;
  roomName: string;
  startAt: string;
  endAt: string;
  reserverName: string;
  participantNames: string[];
  attendees: number;
  status: 'CONFIRMED' | 'CANCELLED';
}

export const SEED_USER: SeedUser = {
  name: '홍길동',
  email: 'hong@company.com',
  role: 'ADMIN',
};

const TODAY = new Date();

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function withDayOffset(base: Date, offset: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + offset);
  return next;
}

function toLocalDateTime(date: Date, time: string) {
  const [hour, minute] = time.split(':').map(Number);
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);

  return `${next.getFullYear()}-${pad2(next.getMonth() + 1)}-${pad2(next.getDate())}T${pad2(hour)}:${pad2(minute)}:00`;
}

const TODAY_DATE = withDayOffset(TODAY, 0);
const TOMORROW_DATE = withDayOffset(TODAY, 1);
const YESTERDAY_DATE = withDayOffset(TODAY, -1);
const CURRENT_HOUR = Math.min(TODAY.getHours(), 22);

export const SEED_ROOMS: SeedRoom[] = [
  {
    id: 'r1',
    name: '오로라룸',
    location: '3층 A존',
    capacity: 8,
    isAvailable: false,
    nextBookingTime: '10:30',
  },
  {
    id: 'r2',
    name: '해피니스룸',
    location: '3층 B존',
    capacity: 12,
    isAvailable: true,
  },
  {
    id: 'r3',
    name: '시너지룸',
    location: '4층 A존',
    capacity: 6,
    isAvailable: false,
    nextBookingTime: '15:30',
  },
  {
    id: 'r4',
    name: '포커스룸',
    location: '4층 B존',
    capacity: 4,
    isAvailable: true,
  },
  {
    id: 'r5',
    name: '스카이라운지',
    location: '5층',
    capacity: 16,
    isAvailable: true,
  },
  {
    id: 'r6',
    name: '브레인룸',
    location: '2층',
    capacity: 10,
    isAvailable: true,
  },
];

export const SEED_TODAY_BOOKINGS: SeedBooking[] = [
  {
    id: 'b1',
    title: '주간 스프린트 플래닝',
    roomName: '오로라룸',
    startAt: toLocalDateTime(TODAY_DATE, '09:30'),
    endAt: toLocalDateTime(TODAY_DATE, '10:30'),
    reserverName: '김지은',
    participantNames: ['김지은', '홍길동', '박민수', '최유진', '오지훈', '한소라'],
    attendees: 6,
    status: 'CONFIRMED',
  },
  {
    id: 'b2',
    title: '신규 기능 리뷰',
    roomName: '해피니스룸',
    startAt: toLocalDateTime(TODAY_DATE, '11:00'),
    endAt: toLocalDateTime(TODAY_DATE, '12:00'),
    reserverName: '홍길동',
    participantNames: ['홍길동', '김지은', '최유진', '정다은'],
    attendees: 4,
    status: 'CONFIRMED',
  },
  {
    id: 'b3',
    title: '디자인 시스템 회의',
    roomName: '시너지룸',
    startAt: toLocalDateTime(TODAY_DATE, '14:00'),
    endAt: toLocalDateTime(TODAY_DATE, '15:30'),
    reserverName: '박민수',
    participantNames: ['박민수', '오지훈', '정다은', '유현우', '강민아'],
    attendees: 5,
    status: 'CONFIRMED',
  },
  {
    id: 'b4',
    title: '긴급 운영 점검',
    roomName: '포커스룸',
    startAt: toLocalDateTime(TODAY_DATE, `${pad2(CURRENT_HOUR)}:00`),
    endAt: toLocalDateTime(TODAY_DATE, `${pad2(CURRENT_HOUR + 1)}:00`),
    reserverName: '홍길동',
    participantNames: ['홍길동', '김지은', '오지훈'],
    attendees: 3,
    status: 'CONFIRMED',
  },
];

export const SEED_MY_BOOKINGS: SeedBooking[] = [
  {
    id: 'mb1',
    title: '신규 기능 리뷰',
    roomName: '해피니스룸',
    startAt: toLocalDateTime(TODAY_DATE, '11:00'),
    endAt: toLocalDateTime(TODAY_DATE, '12:00'),
    reserverName: '홍길동',
    participantNames: ['홍길동', '김지은', '최유진', '정다은'],
    attendees: 4,
    status: 'CONFIRMED',
  },
  {
    id: 'mb2',
    title: '월간 회고',
    roomName: '브레인룸',
    startAt: toLocalDateTime(TOMORROW_DATE, '16:00'),
    endAt: toLocalDateTime(TOMORROW_DATE, '17:00'),
    reserverName: '홍길동',
    participantNames: ['홍길동', '김지은', '오지훈', '한소라', '유현우', '정다은', '박민수'],
    attendees: 7,
    status: 'CONFIRMED',
  },
  {
    id: 'mb3',
    title: '아키텍처 논의',
    roomName: '포커스룸',
    startAt: toLocalDateTime(YESTERDAY_DATE, '10:00'),
    endAt: toLocalDateTime(YESTERDAY_DATE, '11:00'),
    reserverName: '홍길동',
    participantNames: ['홍길동', '강민아', '오지훈'],
    attendees: 3,
    status: 'CANCELLED',
  },
];
