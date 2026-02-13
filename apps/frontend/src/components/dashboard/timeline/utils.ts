import {
  AXIS_LEFT_PX,
  AXIS_RIGHT_PX,
  CURRENT_USER,
  DAY_END_HOUR,
  DAY_START_HOUR,
} from './constants';
import type { Booking, BookingKind } from './types';

/**
 * ISO datetime 문자열에서 분(minutes)으로 변환
 * @example toMinutes("2024-01-01T09:30:00") → 570
 */
export function toMinutes(dateTime: string): number {
  const date = new Date(dateTime);
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * ISO datetime 문자열을 타임라인 퍼센트 위치로 변환
 * @example toPercent("2024-01-01T12:00:00") → 50
 */
export function toPercent(dateTime: string): number {
  const min = toMinutes(dateTime);
  const start = DAY_START_HOUR * 60;
  const end = DAY_END_HOUR * 60;
  const clamped = Math.min(Math.max(min, start), end);
  return ((clamped - start) / (end - start)) * 100;
}

/**
 * 분(minutes)을 "HH:MM" 형식 문자열로 변환
 * @example toTimeString(570) → "09:30"
 */
export function toTimeString(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * "HH:MM" 형식 문자열을 분(minutes)으로 변환
 * @example toMinutesFromTime("09:30") → 570
 */
export function toMinutesFromTime(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

/**
 * Date와 "HH:MM" 시간을 ISO datetime 문자열로 변환
 * @example toDateTimeString(new Date("2024-01-01"), "09:30") → "2024-01-01T00:30:00.000Z"
 */
export function toDateTimeString(date: Date, time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next.toISOString();
}

/**
 * 타임라인 퍼센트를 CSS left 값으로 변환
 * @example getTimelineLeft(50) → "calc(148px + (100% - 160px) * 0.5)"
 */
export function getTimelineLeft(percent: number): string {
  return `calc(${AXIS_LEFT_PX}px + (100% - ${AXIS_LEFT_PX + AXIS_RIGHT_PX}px) * ${percent / 100})`;
}

/**
 * 예약의 종류 판별 (내 예약 | 참여 회의 | 다른 회의)
 */
export function getBookingKind(booking: Booking): BookingKind {
  if (booking.reserverName === CURRENT_USER) return 'mine';
  if (booking.participantNames.includes(CURRENT_USER)) return 'included';
  return 'other';
}

/**
 * 외부참석자 이름 정규화 (외부참석자 1, 외부참석자 2, ...)
 */
export function normalizeExternalParticipants(list: string[]): string[] {
  let externalIndex = 1;
  return list.map((name) => {
    if (!name.startsWith('외부참석자')) return name;
    const renamed = `외부참석자 ${externalIndex}`;
    externalIndex += 1;
    return renamed;
  });
}

/**
 * 두 날짜가 같은 날인지 확인
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 오늘 날짜인지 확인
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * 타임라인 시간 라벨 생성 (2시간 간격)
 * @returns [{ label: "00:00", percent: 0 }, { label: "02:00", percent: 8.33 }, ...]
 */
export function generateTimeLabels(): Array<{ label: string; percent: number }> {
  const marks: Array<{ label: string; percent: number }> = [];
  for (let hour = DAY_START_HOUR; hour <= DAY_END_HOUR; hour += 2) {
    marks.push({
      label: `${String(hour).padStart(2, '0')}:00`,
      percent: ((hour - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)) * 100,
    });
  }
  return marks;
}

/**
 * 타임라인 시간선 퍼센트 배열 생성 (1시간 간격)
 * @returns [0, 4.166..., 8.333..., ...] (25개)
 */
export function generateHourLinePercents(): number[] {
  const points: number[] = [];
  for (let hour = DAY_START_HOUR; hour <= DAY_END_HOUR; hour += 1) {
    const percent =
      ((hour - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)) * 100;
    points.push(percent);
  }
  return points;
}
