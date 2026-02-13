/** 타임라인 시작 시간 (0시) */
export const DAY_START_HOUR = 0;

/** 타임라인 종료 시간 (24시) */
export const DAY_END_HOUR = 24;

/** 현재 사용자 이름 */
export const CURRENT_USER = '홍길동';

/** 타임라인 레이아웃 상수 */
export const TIMELINE_LAYOUT = {
  /** 회의실 정보 영역 너비 */
  ROOM_INFO_WIDTH: 124,
  /** 회의실 정보와 타임라인 사이 간격 */
  GAP: 12,
  /** 행 내부 패딩 */
  ROW_PADDING: 12,
} as const;

/** 타임라인 축 좌표 계산용 */
export const AXIS_LEFT_PX =
  TIMELINE_LAYOUT.ROOM_INFO_WIDTH +
  TIMELINE_LAYOUT.GAP +
  TIMELINE_LAYOUT.ROW_PADDING;

export const AXIS_RIGHT_PX = TIMELINE_LAYOUT.ROW_PADDING;

/** 참석자 선택 옵션 */
export const PARTICIPANT_OPTIONS = [
  '홍길동',
  '김지은',
  '박민수',
  '최유진',
  '오지훈',
  '한소라',
  '정다은',
  '유현우',
  '강민아',
] as const;
