/**
 * Date formatting utilities for CareerFairy application
 * Provides consistent date formatting across the platform
 */

export interface DateFormatOptions {
   includeTime?: boolean
   relative?: boolean
   short?: boolean
}

/**
 * Formats a date into a user-friendly string
 * @param date - The date to format (Date object, string, or timestamp)
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (
   date: Date | string | number,
   options: DateFormatOptions = {}
): string => {
   const { includeTime = false, relative = false, short = false } = options

   if (!date) return ''

   const dateObj = new Date(date)
   
   if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
   }

   if (relative) {
      return formatRelativeDate(dateObj)
   }

   const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: short ? 'short' : 'long',
      day: 'numeric'
   }

   if (includeTime) {
      formatOptions.hour = '2-digit'
      formatOptions.minute = '2-digit'
   }

   return dateObj.toLocaleDateString('en-US', formatOptions)
}

/**
 * Formats a date relative to now (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to format
 * @returns Relative date string
 */
export const formatRelativeDate = (date: Date): string => {
   const now = new Date()
   const diffInMs = date.getTime() - now.getTime()
   const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
   const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
   const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

   if (Math.abs(diffInMinutes) < 1) {
      return 'Just now'
   }

   if (Math.abs(diffInMinutes) < 60) {
      return diffInMinutes > 0
         ? `in ${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`
         : `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) === 1 ? '' : 's'} ago`
   }

   if (Math.abs(diffInHours) < 24) {
      return diffInHours > 0
         ? `in ${diffInHours} hour${diffInHours === 1 ? '' : 's'}`
         : `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) === 1 ? '' : 's'} ago`
   }

   if (Math.abs(diffInDays) < 7) {
      return diffInDays > 0
         ? `in ${diffInDays} day${diffInDays === 1 ? '' : 's'}`
         : `${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'} ago`
   }

   // For dates more than a week away, use absolute formatting
   return formatDate(date, { short: true })
}

/**
 * Formats a date range (e.g., "Jan 15 - Jan 20, 2024")
 * @param startDate - Start date
 * @param endDate - End date
 * @param options - Formatting options
 * @returns Formatted date range string
 */
export const formatDateRange = (
   startDate: Date | string | number,
   endDate: Date | string | number,
   options: DateFormatOptions = {}
): string => {
   const { short = false } = options

   const start = new Date(startDate)
   const end = new Date(endDate)

   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date range'
   }

   const sameYear = start.getFullYear() === end.getFullYear()
   const sameMonth = sameYear && start.getMonth() === end.getMonth()

   if (sameMonth && start.getDate() === end.getDate()) {
      return formatDate(start, options)
   }

   const startFormat: Intl.DateTimeFormatOptions = {
      month: short ? 'short' : 'long',
      day: 'numeric'
   }

   const endFormat: Intl.DateTimeFormatOptions = {
      month: short ? 'short' : 'long',
      day: 'numeric',
      year: 'numeric'
   }

   if (!sameYear) {
      startFormat.year = 'numeric'
   }

   if (sameMonth) {
      return `${start.getDate()} - ${end.toLocaleDateString('en-US', endFormat)}`
   }

   return `${start.toLocaleDateString('en-US', startFormat)} - ${end.toLocaleDateString('en-US', endFormat)}`
}

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date | string | number): boolean => {
   const today = new Date()
   const checkDate = new Date(date)
   
   return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
   )
}

/**
 * Checks if a date is in the past
 * @param date - Date to check
 * @returns True if the date is in the past
 */
export const isPast = (date: Date | string | number): boolean => {
   return new Date(date).getTime() < new Date().getTime()
}

/**
 * Gets the start of day for a given date
 * @param date - Date to get start of day for
 * @returns Date object representing start of day
 */
export const getStartOfDay = (date: Date | string | number): Date => {
   const d = new Date(date)
   d.setHours(0, 0, 0, 0)
   return d
}

/**
 * Gets the end of day for a given date
 * @param date - Date to get end of day for
 * @returns Date object representing end of day
 */
export const getEndOfDay = (date: Date | string | number): Date => {
   const d = new Date(date)
   d.setHours(23, 59, 59, 999)
   return d
}