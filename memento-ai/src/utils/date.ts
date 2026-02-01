import { format, parseISO } from 'date-fns'

// Format date to match iOS app display: "1/15/26, 3:45 PM"
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, 'M/d/yy, h:mm a')
  } catch {
    return dateString
  }
}

// Format date for display with full year
export function formatDateLong(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, 'MMMM d, yyyy h:mm a')
  } catch {
    return dateString
  }
}
