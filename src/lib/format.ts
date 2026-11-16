// The demo runs in UTC+8, so times are shown in that time zone.
const DISPLAY_TIME_ZONE = 'Asia/Manila'

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: DISPLAY_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}