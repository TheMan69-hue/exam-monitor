// Server actions redirect with ?notice=... and the Toaster shows it once.
export function withNotice(path: string, message: string): string {
  const joiner = path.includes('?') ? '&' : '?'
  return `${path}${joiner}notice=${encodeURIComponent(message)}`
}
