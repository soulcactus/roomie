export type ViewState = 'loading' | 'success' | 'empty' | 'error';

export function getViewState(searchValue: string | null): Exclude<ViewState, 'loading'> {
  if (searchValue === 'empty' || searchValue === 'error') {
    return searchValue;
  }

  return 'success';
}

export function formatTimeRange(startAt: string, endAt: string) {
  const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${timeFormatter.format(new Date(startAt))} - ${timeFormatter.format(new Date(endAt))}`;
}

export function formatDate(dateTime: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(new Date(dateTime));
}
