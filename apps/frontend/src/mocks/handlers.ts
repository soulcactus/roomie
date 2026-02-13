import { delay, http, HttpResponse } from 'msw';
import {
  cancelBooking,
  createBooking,
  createDashboardBooking,
  deleteDashboardBooking,
  getCurrentUser,
  getDashboardBookings,
  getRooms,
  listBookings,
  listMyBookings,
  listRoomBookings,
  loginByEmail,
  logoutUser,
  registerUser,
  updateDashboardBooking,
} from './data';

const BASE_PATTERN = '*/api/v1';

export const handlers = [
  http.post(`${BASE_PATTERN}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return HttpResponse.json(
        { message: '이메일과 비밀번호를 입력해 주세요.' },
        { status: 400 },
      );
    }

    const user = loginByEmail(body.email);
    await delay(500);

    if (!user) {
      return HttpResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      data: {
        accessToken: `mock-token-${user.id}`,
      },
    });
  }),

  http.post(`${BASE_PATTERN}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json(
        { message: '필수 입력값이 누락되었습니다.' },
        { status: 400 },
      );
    }

    const user = registerUser({ email: body.email, name: body.name });
    await delay(600);

    if (!user) {
      return HttpResponse.json(
        { message: '이미 존재하는 이메일입니다.' },
        { status: 409 },
      );
    }

    return HttpResponse.json({ data: user }, { status: 201 });
  }),

  http.post(`${BASE_PATTERN}/auth/logout`, async () => {
    logoutUser();
    await delay(300);
    return HttpResponse.json({ data: { message: '로그아웃 되었습니다.' } });
  }),

  http.post(`${BASE_PATTERN}/auth/refresh`, async () => {
    const user = getCurrentUser();
    await delay(300);

    if (!user) {
      return HttpResponse.json(
        { message: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    return HttpResponse.json({ data: { accessToken: `mock-token-${user.id}` } });
  }),

  http.get(`${BASE_PATTERN}/users/me`, async () => {
    const user = getCurrentUser();
    await delay(250);

    if (!user) {
      return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }

    return HttpResponse.json({ data: user });
  }),

  http.get(`${BASE_PATTERN}/dashboard/rooms`, async () => {
    await delay(250);
    return HttpResponse.json({ data: getRooms() });
  }),

  http.get(`${BASE_PATTERN}/dashboard/bookings`, async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get('mine') === 'true';
    await delay(250);

    const { today, mine } = getDashboardBookings();

    return HttpResponse.json({
      data: mineOnly ? mine : today,
    });
  }),

  http.post(`${BASE_PATTERN}/dashboard/bookings`, async ({ request }) => {
    const body = (await request.json()) as {
      id: string;
      title: string;
      roomName: string;
      startAt: string;
      endAt: string;
      reserverName: string;
      participantNames: string[];
      attendees: number;
      status: 'CONFIRMED' | 'CANCELLED';
    };

    await delay(300);

    return HttpResponse.json(
      {
        data: createDashboardBooking(body),
      },
      { status: 201 },
    );
  }),

  http.put(`${BASE_PATTERN}/dashboard/bookings/:id`, async ({ params, request }) => {
    const bookingId = String(params.id);
    const body = (await request.json()) as {
      title: string;
      roomName: string;
      startAt: string;
      endAt: string;
      reserverName: string;
      participantNames: string[];
      attendees: number;
      status: 'CONFIRMED' | 'CANCELLED';
    };

    await delay(300);

    updateDashboardBooking(bookingId, (booking) => ({ ...booking, ...body }));

    return HttpResponse.json({ data: { id: bookingId } });
  }),

  http.delete(`${BASE_PATTERN}/dashboard/bookings/:id`, async ({ params }) => {
    const bookingId = String(params.id);
    await delay(250);
    deleteDashboardBooking(bookingId);
    return HttpResponse.json({ data: { id: bookingId } });
  }),

  http.get(`${BASE_PATTERN}/bookings`, async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') ?? undefined;
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;
    const page = Number(searchParams.get('page') ?? '1');

    await delay(250);

    const data = listBookings({ roomId, startDate, endDate });
    return HttpResponse.json({
      data,
      meta: {
        total: data.length,
        page,
        limit: data.length,
        totalPages: 1,
      },
    });
  }),

  http.get(`${BASE_PATTERN}/bookings/my`, async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') ?? '1');
    await delay(250);

    const data = listMyBookings();

    return HttpResponse.json({
      data,
      meta: {
        total: data.length,
        page,
        limit: data.length,
        totalPages: 1,
      },
    });
  }),

  http.get(`${BASE_PATTERN}/bookings/room/:roomId`, async ({ params, request }) => {
    const roomId = String(params.roomId);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') ?? undefined;

    await delay(250);
    return HttpResponse.json({ data: listRoomBookings(roomId, date) });
  }),

  http.post(`${BASE_PATTERN}/bookings`, async ({ request }) => {
    const body = (await request.json()) as {
      roomId?: string;
      title?: string;
      startAt?: string;
      endAt?: string;
    };

    if (!body.roomId || !body.title || !body.startAt || !body.endAt) {
      return HttpResponse.json(
        { message: '필수 입력값이 누락되었습니다.' },
        { status: 400 },
      );
    }

    await delay(300);

    const result = createBooking({
      roomId: body.roomId,
      title: body.title,
      startAt: body.startAt,
      endAt: body.endAt,
    });

    if ('error' in result) {
      if (result.error === 'UNAUTHORIZED') {
        return HttpResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
      }

      if (result.error === 'CONFLICT') {
        return HttpResponse.json(
          { message: '해당 시간에 이미 예약이 있습니다.' },
          { status: 409 },
        );
      }
    }

    return HttpResponse.json({ data: result.data }, { status: 201 });
  }),

  http.delete(`${BASE_PATTERN}/bookings/:id`, async ({ params }) => {
    const bookingId = String(params.id);
    await delay(250);

    const result = cancelBooking(bookingId);

    if ('error' in result) {
      if (result.error === 'UNAUTHORIZED') {
        return HttpResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
      }

      if (result.error === 'FORBIDDEN') {
        return HttpResponse.json(
          { message: '본인의 예약만 취소할 수 있습니다.' },
          { status: 403 },
        );
      }

      return HttpResponse.json({ message: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    return HttpResponse.json({ data: { message: '예약이 취소되었습니다.' } });
  }),
];
