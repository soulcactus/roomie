import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type Team =
  | 'product'
  | 'design'
  | 'engineering'
  | 'sales'
  | 'ops';

const USER_PROFILES: Array<{ email: string; name: string; team: Team }> = [
  { email: 'hong@roomie.com', name: '홍길동', team: 'product' },
  { email: 'jiyoon@roomie.com', name: '김지윤', team: 'design' },
  { email: 'minsoo@roomie.com', name: '박민수', team: 'engineering' },
  { email: 'yujin@roomie.com', name: '최유진', team: 'product' },
  { email: 'jihoon@roomie.com', name: '오지훈', team: 'engineering' },
  { email: 'seora@roomie.com', name: '한소라', team: 'design' },
  { email: 'daeun@roomie.com', name: '정다은', team: 'ops' },
  { email: 'hyunwoo@roomie.com', name: '유현우', team: 'sales' },
  { email: 'mina@roomie.com', name: '강민아', team: 'product' },
  { email: 'taehyun@roomie.com', name: '이태현', team: 'engineering' },
  { email: 'nayoung@roomie.com', name: '임나영', team: 'sales' },
  { email: 'dongha@roomie.com', name: '김동하', team: 'engineering' },
  { email: 'jiyeon@roomie.com', name: '서지연', team: 'ops' },
  { email: 'junho@roomie.com', name: '최준호', team: 'sales' },
  { email: 'sujin@roomie.com', name: '윤수진', team: 'design' },
];

async function seedAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@roomie.com';
  const adminName = process.env.SEED_ADMIN_NAME ?? '관리자';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD 환경변수가 필요합니다.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
}

async function seedUsers() {
  const userPassword = process.env.SEED_USER_PASSWORD;
  if (!userPassword) {
    throw new Error('SEED_USER_PASSWORD 환경변수가 필요합니다.');
  }

  for (const user of USER_PROFILES) {
    const hashedPassword = await bcrypt.hash(userPassword, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: Role.USER },
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: Role.USER,
      },
    });
  }
}

async function seedRooms() {
  const rooms = [
    {
      name: '오로라',
      location: '본관 3층',
      capacity: 6,
      amenities: [],
    },
    {
      name: '라운지',
      location: '본관 5층',
      capacity: 10,
      amenities: [],
    },
    {
      name: '허들룸',
      location: '신관 2층',
      capacity: 4,
      amenities: [],
    },
    {
      name: '시리우스',
      location: '본관 2층',
      capacity: 8,
      amenities: [],
    },
    {
      name: '폴라리스',
      location: '본관 4층',
      capacity: 12,
      amenities: [],
    },
    {
      name: '비너스',
      location: '신관 3층',
      capacity: 5,
      amenities: [],
    },
    {
      name: '머큐리',
      location: '신관 4층',
      capacity: 7,
      amenities: [],
    },
    {
      name: '넵튠',
      location: '별관 1층',
      capacity: 14,
      amenities: [],
    },
    {
      name: '주피터',
      location: '별관 2층',
      capacity: 16,
      amenities: [],
    },
    {
      name: '새턴',
      location: '별관 3층',
      capacity: 20,
      amenities: [],
    },
  ];

  for (const room of rooms) {
    const existingRoom = await prisma.room.findFirst({
      where: { name: room.name },
      select: { id: true },
    });

    if (existingRoom) {
      await prisma.room.update({
        where: { id: existingRoom.id },
        data: {
          location: room.location,
          capacity: room.capacity,
          amenities: room.amenities,
          isActive: true,
        },
      });
      continue;
    }

    await prisma.room.create({ data: room });
  }
}

function createDateTime(date: Date, hour: number, minute = 0) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
    minute,
    0,
    0,
  );
}

function createDateTimeFromMinute(date: Date, totalMinute: number) {
  const hour = Math.floor(totalMinute / 60);
  const minute = totalMinute % 60;
  return createDateTime(date, hour, minute);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function hasOverlap(
  intervals: Array<{ dateKey: string; start: number; end: number }>,
  dateKey: string,
  start: number,
  end: number,
) {
  return intervals.some(
    (interval) =>
      interval.dateKey === dateKey && start < interval.end && end > interval.start,
  );
}

function hasSimpleOverlap(
  intervals: Array<{ start: number; end: number }>,
  start: number,
  end: number,
) {
  return intervals.some((interval) => start < interval.end && end > interval.start);
}

function createDailyDates(year: number, monthFrom: number, monthTo: number) {
  const dates: Date[] = [];
  const current = new Date(year, monthFrom - 1, 1);
  const end = new Date(year, monthTo, 0);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

async function seedBookings() {
  const now = new Date();
  const targetYear = Number(process.env.SEED_BOOKING_YEAR ?? now.getFullYear());
  const bookingDates = createDailyDates(targetYear, 2, 3); // 2월 ~ 3월

  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true },
  });

  if (rooms.length === 0 || users.length === 0) {
    return;
  }

  const me = users.find((user) => user.name === '홍길동') ?? users[0];
  const otherUsers = users.filter((user) => user.id !== me.id);
  if (otherUsers.length === 0) {
    return;
  }

  const rangeStart = createDateTime(bookingDates[0], 0, 0);
  const rangeEnd = createDateTime(bookingDates[bookingDates.length - 1], 23, 59);

  await prisma.booking.deleteMany({
    where: {
      startAt: { gte: rangeStart, lte: rangeEnd },
    },
  });

  const teamByEmail = new Map(USER_PROFILES.map((user) => [user.email, user.team]));
  const teamTitles: Record<Team, string[]> = {
    product: [
      '로드맵 정렬 회의',
      '요구사항 정의 워크숍',
      '백로그 우선순위 점검',
      '프로덕트 KPI 리뷰',
      '분기 목표 조정',
    ],
    design: [
      'UI 품질 리뷰',
      '사용성 테스트 회고',
      '디자인 시스템 점검',
      '프로토타입 피드백',
      '인터랙션 스펙 합의',
    ],
    engineering: [
      '아키텍처 리뷰',
      '성능 개선 회의',
      '배포 리허설',
      '장애 원인 분석',
      'API 스펙 검토',
    ],
    sales: [
      '고객 제안 전략 회의',
      '리드 파이프라인 점검',
      '파트너십 협의',
      '영업 성과 리뷰',
      '데모 시나리오 정리',
    ],
    ops: [
      '운영 정책 점검',
      '정산 프로세스 리뷰',
      '지원 이슈 트리아지',
      '온보딩 운영 회의',
      '내부 프로세스 개선',
    ],
  };
  const crossTitles = [
    '크로스팀 싱크',
    '주간 스탠드업',
    '월간 타운홀 준비',
    '분기 OKR 점검',
    '협업 프로세스 점검',
  ];
  const durations = [30, 45, 60, 75, 90, 120, 150, 180];

  const bookings: Array<{
    roomId: string;
    userId: string;
    title: string;
    startAt: Date;
    endAt: Date;
    status: 'CONFIRMED';
  }> = [];
  const myInvolvementIntervals: Array<{ dateKey: string; start: number; end: number }> = [];

  for (let dayIndex = 0; dayIndex < bookingDates.length; dayIndex += 1) {
    const date = bookingDates[dayIndex];
    const dateKey = toDateKey(date);
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex += 1) {
      const room = rooms[roomIndex];
      // 룸별/날짜별 밀도 조절: 어떤 날은 해당 룸이 거의 비거나 완전히 비도록 만듦
      const roomDaySeed = (dayIndex + 11) * (roomIndex + 7);
      const roomDailyMode = roomDaySeed % 5; // 0: 완전 비움, 1: 저밀도, 2~4: 일반
      if (roomDailyMode === 0) {
        continue;
      }

      const targetSlots =
        roomDailyMode === 1
          ? 1 + (roomDaySeed % 2) // 1~2개
          : 2 + (roomDaySeed % 4); // 2~5개

      const roomIntervals: Array<{ start: number; end: number }> = [];
      let slotIndex = 0;
      let createdForRoom = 0;

      while (createdForRoom < targetSlots) {
        const duration = durations[(dayIndex + roomIndex + slotIndex) % durations.length];
        const maxStartMinute = 24 * 60 - duration;
        if (maxStartMinute <= 0) break;

        const mixSeed = (dayIndex + 1) * (roomIndex + 3) + slotIndex;
        const bucket = mixSeed % 6;
        let kind: 'mine' | 'included' | 'other' =
          bucket === 0 || bucket === 3
            ? 'mine'
            : bucket === 1 || bucket === 4
              ? 'included'
              : 'other';

        const owner =
          kind === 'mine'
            ? me
            : otherUsers[(dayIndex + roomIndex + slotIndex) % otherUsers.length];

        let accepted: { start: number; end: number; kind: 'mine' | 'included' | 'other' } | null =
          null;

        // 24시간 전체에서 시작 시간이 고르게 분포되도록 후보를 순회
        for (let attempt = 0; attempt < 24; attempt += 1) {
          const hourCandidate =
            (dayIndex * 7 + roomIndex * 11 + slotIndex * 5 + attempt * 3) % 24;
          const minuteOffset = [0, 15, 30, 45][
            (dayIndex + roomIndex + slotIndex + attempt) % 4
          ];
          const startCandidate = hourCandidate * 60 + minuteOffset;
          if (startCandidate > maxStartMinute) continue;

          const endCandidate = startCandidate + duration;
          if (hasSimpleOverlap(roomIntervals, startCandidate, endCandidate)) continue;

          const involveMe = kind === 'mine' || kind === 'included';
          if (
            involveMe &&
            hasOverlap(myInvolvementIntervals, dateKey, startCandidate, endCandidate)
          ) {
            // 내 예약/참여가 같은 시간대에 겹치면 다른 회의로 다운그레이드
            accepted = { start: startCandidate, end: endCandidate, kind: 'other' };
            break;
          }

          accepted = { start: startCandidate, end: endCandidate, kind };
          break;
        }

        if (!accepted) {
          slotIndex += 1;
          if (slotIndex > 24) break;
          continue;
        }

        const finalKind = accepted.kind;
        const variantOffset =
          finalKind === 'mine' ? 0 : finalKind === 'included' ? 1 : 2;
        const ownerTeam = teamByEmail.get(owner.email) ?? 'engineering';
        const ownTeamTitles = teamTitles[ownerTeam];
        const isCrossTeam = (dayIndex + roomIndex + slotIndex) % 4 === 0;
        const baseTitle = isCrossTeam
          ? crossTitles[(dayIndex + roomIndex * 2 + slotIndex) % crossTitles.length]
          : ownTeamTitles[
              (dayIndex + roomIndex * 2 + slotIndex + variantOffset) % ownTeamTitles.length
            ];
        const title = finalKind === 'included' ? `${baseTitle} (참여)` : baseTitle;

        bookings.push({
          roomId: room.id,
          userId: owner.id,
          title,
          startAt: createDateTimeFromMinute(date, accepted.start),
          endAt: createDateTimeFromMinute(date, accepted.end),
          status: 'CONFIRMED',
        });
        roomIntervals.push({ start: accepted.start, end: accepted.end });
        if (finalKind === 'mine' || finalKind === 'included') {
          myInvolvementIntervals.push({
            dateKey,
            start: accepted.start,
            end: accepted.end,
          });
        }
        createdForRoom += 1;
        slotIndex += 1;
      }
    }
  }

  await prisma.booking.createMany({ data: bookings });
}

async function main() {
  await seedAdmin();
  await seedUsers();
  await seedRooms();
  await seedBookings();
  console.log('Seed 완료: 관리자/사용자/회의실/2~3월 예약 데이터가 준비되었습니다.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
