// The demo runs in UTC+8, so times are shown in that time zone.
const DISPLAY_TIME_ZONE = 'Asia/Manila'

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: DISPLAY_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: DISPLAY_TIME_ZONE,
    timeStyle: 'short',
  })
}

// Compares calendar days in the display time zone.
export function isToday(iso: string): boolean {
  const day = (date: Date) =>
    date.toLocaleDateString('en-CA', { timeZone: DISPLAY_TIME_ZONE })
  return day(new Date(iso)) === day(new Date())
}
