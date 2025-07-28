import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWorkingDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)
  while (current <= endDate) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++ // Exclude Sunday (0) and Saturday (6)
    current.setDate(current.getDate() + 1)
  }
  return count
}

export function getAgingBucket(months: number): string {
  if (months <= 6) return "0–6 months"
  if (months <= 18) return "7–18 months"
  return ">18 months"
}
