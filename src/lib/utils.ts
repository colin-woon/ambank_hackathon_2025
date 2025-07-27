import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addWorkingDays(startDate: Date, days: number): Date {
	let date = new Date(startDate)
	let added = 0
	while (added < days) {
		date.setDate(date.getDate() + 1)
		const day = date.getDay()
		if (day !== 0 && day !== 6) added++
	}
	return date
}

export function calculateDeadlineFromScore(score: number, startDate: Date): Date {
	let days = 15
	if (score >= 5 && score <= 8) days = 30
	else if (score >= 9 && score <= 12) days = 60
	else if (score >= 13 && score <= 15) days = 90
	else if (score > 15) days = 120
	return addWorkingDays(startDate, days)
}
