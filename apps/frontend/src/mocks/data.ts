import {
  SEED_MY_BOOKINGS,
  SEED_ROOMS,
  SEED_TODAY_BOOKINGS,
  SEED_USER,
  type SeedBooking,
  type SeedRoom,
} from './seeds';

export interface MockApiUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface ApiBooking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  room: {
    id: string;
    name: string;
    location?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const seededUsers: MockApiUser[] = [
  {
    id: 'u-admin',
    email: 'admin@roomie.com',
    name: '관리자',
    role: 'ADMIN',
  },
  {
    id: 'u-1',
    email: SEED_USER.email,
    name: SEED_USER.name,
    role: SEED_USER.role,
  },
  {
    id: 'u-2',
    email: 'test@test.com',
    name: '테스트 사용자',
    role: 'USER',
  },
];

let currentUser: MockApiUser | null = seededUsers[0];
const rooms: SeedRoom[] = [...SEED_ROOMS];
let todayBookings: SeedBooking[] = [...SEED_TODAY_BOOKINGS];
let myBookings: SeedBooking[] = [...SEED_MY_BOOKINGS];

const roomByName = new Map(rooms.map((room) => [room.name, room] as const));

function findUserByName(name: string, index: number) {
  if (name === SEED_USER.name) {
    return seededUsers[0];
  }

  return {
    id: `u-ext-${index}`,
    name,
    email: `${name.replace(/\s+/g, '').toLowerCase()}@company.com`,
    role: 'USER' as const,
  };
}

function toApiBooking(booking: SeedBooking, index: number): ApiBooking {
  const room = roomByName.get(booking.roomName);
  const user = findUserByName(booking.reserverName, index);

  return {
    id: booking.id,
    roomId: room?.id ?? 'unknown-room',
    userId: user.id,
    title: booking.title,
    startAt: booking.startAt,
    endAt: booking.endAt,
    status: booking.status,
    room: {
      id: room?.id ?? 'unknown-room',
      name: booking.roomName,
      location: room?.location,
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function hasOverlap(input: { roomId: string; startAt: string; endAt: string }) {
  const startMs = new Date(input.startAt).getTime();
  const endMs = new Date(input.endAt).getTime();

  return bookings.some((booking) => {
    if (booking.roomId !== input.roomId) return false;
    if (booking.status === 'CANCELLED') return false;

    const bookingStart = new Date(booking.startAt).getTime();
    const bookingEnd = new Date(booking.endAt).getTime();
    return startMs < bookingEnd && endMs > bookingStart;
  });
}

let bookings: ApiBooking[] = Array.from(
  new Map(
    [...SEED_TODAY_BOOKINGS, ...SEED_MY_BOOKINGS].map((booking, index) => [
      booking.id,
      toApiBooking(booking, index),
    ]),
  ).values(),
);

export function getCurrentUser() {
  return currentUser;
}

export function listEmployees() {
  return seededUsers.map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
  }));
}

export function loginByEmail(email: string) {
  const found = seededUsers.find((user) => user.email === email);
  if (!found) {
    return null;
  }

  currentUser = found;
  return found;
}

export function registerUser(input: { email: string; name: string }) {
  const exists = seededUsers.some((user) => user.email === input.email);
  if (exists) {
    return null;
  }

  const nextUser: MockApiUser = {
    id: `u-${Date.now()}`,
    email: input.email,
    name: input.name,
    role: 'USER',
  };

  seededUsers.push(nextUser);
  currentUser = nextUser;
  return nextUser;
}

export function logoutUser() {
  currentUser = null;
}

export function getRooms() {
  return rooms;
}

export function getDashboardBookings() {
  return {
    today: todayBookings,
    mine: myBookings,
  };
}

export function createDashboardBooking(booking: SeedBooking) {
  todayBookings = [...todayBookings, booking];

  if (booking.reserverName === SEED_USER.name) {
    myBookings = [...myBookings, booking];
  }

  const mapped = toApiBooking(booking, Date.now());
  bookings = [...bookings, mapped];

  return booking;
}

export function updateDashboardBooking(
  bookingId: string,
  updater: (booking: SeedBooking) => SeedBooking,
) {
  todayBookings = todayBookings.map((booking) =>
    booking.id === bookingId ? updater(booking) : booking,
  );
  myBookings = myBookings.map((booking) =>
    booking.id === bookingId ? updater(booking) : booking,
  );

  const updated = [...todayBookings, ...myBookings].find((booking) => booking.id === bookingId);
  if (updated) {
    const mapped = toApiBooking(updated, Date.now());
    bookings = bookings.map((booking) =>
      booking.id === bookingId ? mapped : booking,
    );
  }
}

export function deleteDashboardBooking(bookingId: string) {
  todayBookings = todayBookings.filter((booking) => booking.id !== bookingId);
  myBookings = myBookings.filter((booking) => booking.id !== bookingId);
  bookings = bookings.filter((booking) => booking.id !== bookingId);
}

export function listBookings(filters: {
  roomId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return bookings.filter((booking) => {
    if (filters.roomId && booking.roomId !== filters.roomId) {
      return false;
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (new Date(booking.startAt).getTime() < start.getTime()) {
        return false;
      }
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      if (new Date(booking.endAt).getTime() > end.getTime()) {
        return false;
      }
    }

    return true;
  });
}

export function listMyBookings() {
  if (!currentUser) return [];
  const userId = currentUser.id;
  return bookings.filter((booking) => booking.userId === userId);
}

export function listRoomBookings(roomId: string, date?: string) {
  return bookings.filter((booking) => {
    if (booking.roomId !== roomId) return false;
    if (!date) return true;
    return isSameDay(new Date(booking.startAt), new Date(date));
  });
}

export function createBooking(input: {
  roomId: string;
  title: string;
  startAt: string;
  endAt: string;
}) {
  if (!currentUser) {
    return { error: 'UNAUTHORIZED' as const };
  }
  const user = currentUser;

  if (hasOverlap(input)) {
    return { error: 'CONFLICT' as const };
  }

  const room = rooms.find((item) => item.id === input.roomId);
  const created: ApiBooking = {
    id: `bk-${Date.now()}`,
    roomId: input.roomId,
    userId: user.id,
    title: input.title,
    startAt: input.startAt,
    endAt: input.endAt,
    status: 'CONFIRMED',
    room: {
      id: room?.id ?? input.roomId,
      name: room?.name ?? '알 수 없는 회의실',
      location: room?.location,
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };

  bookings = [...bookings, created];
  return { data: created };
}

export function cancelBooking(bookingId: string) {
  if (!currentUser) {
    return { error: 'UNAUTHORIZED' as const };
  }

  const target = bookings.find((booking) => booking.id === bookingId);

  if (!target) {
    return { error: 'NOT_FOUND' as const };
  }

  if (target.userId !== currentUser.id) {
    return { error: 'FORBIDDEN' as const };
  }

  bookings = bookings.map((booking) =>
    booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking,
  );

  return { data: { id: bookingId } };
}
