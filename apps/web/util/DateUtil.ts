import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import calendar from "dayjs/plugin/calendar"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone" // dependent on utc plugin
import updateLocale from "dayjs/plugin/updateLocale"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(calendar)
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(updateLocale)

// Configure relative time formatting
dayjs.updateLocale("en", {
   relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      m: "1 minute",
      mm: "%d minutes",
      h: "1 hour",
      hh: "%d hours",
      d: "1 day",
      dd: "%d days",
      M: "1 month",
      MM: "%d months",
      y: "1 year",
      yy: "%d years",
   },
})

export default class DateUtil {
   static getJobApplicationDate(JSDate: Date) {
      return dayjs(JSDate).format("DD MMM YYYY")
   }
   static getTodaysISODate() {
      const today = new Date()
      const todaysYear = today.getFullYear()
      const todaysMonth =
         today.getMonth() + 1 > 9
            ? today.getMonth() + 1
            : "0" + (today.getMonth() + 1)
      const todaysDate =
         today.getDate() > 9 ? today.getDate() : "0" + today.getDate()
      return todaysYear + "-" + todaysMonth + "-" + todaysDate
   }

   static monthAndDay(date: Date) {
      return dayjs(date).format("MMM DD")
   }
   static eventPreviewDate(JSDate: Date) {
      return dayjs(JSDate).format("MMMM Do, HH:mm")
   }

   static dateWithYear(JSDate: Date) {
      return dayjs(JSDate).format("LL LT") // October 21, 2019 10:00 AM
   }

   static eventPreviewHour(JSDate: Date) {
      return dayjs(JSDate).format("HH:mm")
   }
   static getUpcomingDate(JSDate: Date | string) {
      return dayjs(JSDate).format("dddd, MMM D, YYYY h:mm A")
   }
   static getStreamTime(JSDate: Date) {
      return dayjs(JSDate).format("hh:ss z")
   }
   static getStreamDate(JSDate: Date) {
      return dayjs(JSDate).format("dddd, MMMM D")
   }
   static getRatingDate(JSDate: Date | string) {
      return dayjs(JSDate).format("D MMMM YYYY")
   }

   /**
    * Transforms a JavaScript Date object into a string formatted as "DD/MM/YYYY"
    * using the dayjs library.
    *
    * @param {Date} JSDate - The JavaScript Date object to be transformed.
    * @return {string} - The resulting string formatted as "DD/MM/YYYY".
    */
   static formatDateToString(JSDate: Date) {
      return dayjs(JSDate).format("DD/MM/YYYY")
   }

   static eventStartDate(JSDate: Date) {
      return dayjs(JSDate).format("DD/MM/YYYY HH:mm")
   }

   static getRelativeDate(JSDate: Date) {
      const now = new Date()
      return dayjs(JSDate).calendar(now, {
         sameDay: "[Today,] h:mm", // The same day ( Today, 2:30  )
         nextDay: "[Tomorrow,] h:mm", // The next day ( Tomorrow, 2:30 )
         nextWeek: "dddd[,] h:mm", // The next week ( Sunday, 2:30 )
         lastDay: "[Yesterday,] h:mm", // The day before ( Yesterday, 2:30 )
         lastWeek: "[Last] dddd[,] h:mm", // Last week ( Last Monday, 2:30 )
         sameElse: "DD.MM[,] h:mm A", // Everything else ( 17.10, 2:30 )
      })
   }

   static getTomorrowDate() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      return tomorrow
   }

   static getTimeAgo(JSDate: Date) {
      return dayjs(JSDate).fromNow() // 2 hours ago, 2 days ago, 2 months ago, 2 years ago
   }

   static getISODateTime(JSDate: Date) {
      const year = JSDate.getFullYear()
      const month =
         JSDate.getMonth() + 1 > 9
            ? JSDate.getMonth() + 1
            : "0" + (JSDate.getMonth() + 1)
      const day =
         JSDate.getDate() > 9 ? JSDate.getDate() : "0" + JSDate.getDate()
      const hours =
         JSDate.getHours() > 9 ? JSDate.getHours() : "0" + JSDate.getHours()
      const minutes =
         JSDate.getMinutes() > 9
            ? JSDate.getMinutes()
            : "0" + JSDate.getMinutes()
      const seconds =
         JSDate.getSeconds() > 9
            ? JSDate.getSeconds()
            : "0" + JSDate.getSeconds()
      return (
         year +
         "-" +
         month +
         "-" +
         day +
         " " +
         hours +
         ":" +
         minutes +
         ":" +
         seconds
      )
   }

   static getAddEventDateTime(JSDate: Date) {
      const year = JSDate.getFullYear()
      const month =
         JSDate.getMonth() + 1 > 9
            ? JSDate.getMonth() + 1
            : "0" + (JSDate.getMonth() + 1)
      const day =
         JSDate.getDate() > 9 ? JSDate.getDate() : "0" + JSDate.getDate()
      const hours =
         JSDate.getHours() > 9 ? JSDate.getHours() : "0" + JSDate.getHours()
      const minutes =
         JSDate.getMinutes() > 9
            ? JSDate.getMinutes()
            : "0" + JSDate.getMinutes()
      const seconds =
         JSDate.getSeconds() > 9
            ? JSDate.getSeconds()
            : "0" + JSDate.getSeconds()
      return (
         day +
         "." +
         month +
         "." +
         year +
         " " +
         hours +
         ":" +
         minutes +
         ":" +
         seconds
      )
   }

   static getPrettyDate(JSDate: Date) {
      return (
         DateUtil.getMonth(JSDate.getMonth()) +
         " " +
         JSDate.getDate() +
         ", " +
         JSDate.getHours() +
         ":" +
         DateUtil.getTimeMinutes(JSDate.getMinutes())
      )
   }

   static getPrettyDateWithoutHour(JSDate: Date) {
      return (
         JSDate.getDate() +
         " " +
         DateUtil.getMonth(JSDate.getMonth()) +
         " " +
         JSDate.getFullYear()
      )
   }

   static getPrettyDateShort(JSDate: Date) {
      return (
         JSDate.getDate() +
         "." +
         JSDate.getMonth() +
         " " +
         JSDate.getHours() +
         ":" +
         DateUtil.getTimeMinutes(JSDate.getMinutes())
      )
   }

   static getPrettyDay(JSDate: Date) {
      return DateUtil.getMonth(JSDate.getMonth()) + " " + JSDate.getDate()
   }

   static getPrettyTime(JSDate: Date) {
      return (
         JSDate.getHours() + ":" + DateUtil.getTimeMinutes(JSDate.getMinutes())
      )
   }

   static getMonth(JsDateMonth: number, isAbbreviated = false) {
      switch (JsDateMonth) {
         case 0:
            return isAbbreviated ? "JAN" : "January"
         case 1:
            return isAbbreviated ? "FEB" : "February"
         case 2:
            return isAbbreviated ? "MAR" : "March"
         case 3:
            return isAbbreviated ? "APR" : "April"
         case 4:
            return isAbbreviated ? "MAY" : "May"
         case 5:
            return isAbbreviated ? "JUN" : "June"
         case 6:
            return isAbbreviated ? "JUL" : "July"
         case 7:
            return isAbbreviated ? "AUG" : "August"
         case 8:
            return isAbbreviated ? "SEPT" : "September"
         case 9:
            return isAbbreviated ? "OCT" : "October"
         case 10:
            return isAbbreviated ? "NOV" : "November"
         case 11:
            return isAbbreviated ? "DEC" : "December"
         default:
            return ""
      }
   }

   static getDayExtension(JsDateDay: number) {
      switch (JsDateDay) {
         case 1:
            return "st"
         case 2:
            return "nd"
         case 3:
            return "rd"
         default:
            return "th"
      }
   }

   static getTimeMinutes(JsTimeMinutes: number) {
      if (JsTimeMinutes < 10) {
         return "0" + JsTimeMinutes
      } else {
         return JsTimeMinutes
      }
   }

   static getCurrentTimeZone() {
      return (
         Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || "Europe/Zurich"
      )
   }

   static getDifferenceInDays(dateFrom: Date, dateTo: Date) {
      const differenceInTime = dateTo.getTime() - dateFrom.getTime()
      return differenceInTime / (1000 * 60 * 60 * 24)
   }

   /**
    * Calculates the time left until a specified date or timestamp.
    *
    * @param {Date | number} time - The target time as a Date object or a timestamp in milliseconds.
    * @return An object containing the time left in days, hours, minutes, and seconds.
    *                  Example: { Days: 0, Hours: 0, Minutes: 0, Seconds: 0 }
    */
   static calculateTimeLeft(time: Date | number) {
      const targetTime = typeof time === "number" ? time : time.getTime()
      const difference = targetTime - new Date().getTime()
      let timeLeft = {
         Days: 0,
         Hours: 0,
         Minutes: 0,
         Seconds: 0,
      }

      if (difference > 0) {
         timeLeft = {
            Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            Minutes: Math.floor((difference / 1000 / 60) % 60),
            Seconds: Math.floor((difference / 1000) % 60),
         }
      }

      return timeLeft
   }

   static addDaysToDate(date: Date, numberOfDays: number) {
      const result = date
      result.setDate(date.getDate() + numberOfDays)

      return result
   }

   static formatLiveDate(JSDate: Date) {
      const formattedDate = dayjs(JSDate).format(
         "dddd, DD MMM YYYY [at] h:mm A"
      )
      return `Live on ${formattedDate}` // Live on Monday, 12 Oct 2020 at 12:00 PM
   }

   static formatPastDate(JSDate: Date) {
      const formattedDate = dayjs(JSDate).format("DD MMM YYYY")
      return `Live streamed on: ${formattedDate}` // Release date: 15 Dec 2022
   }

   /**
    * Transforms a duration in milliseconds into a human readable relative time string formatted as "X days"
    * using the dayjs library.
    *
    * @param {number} milliseconds - The duration in milliseconds to be transformed.
    * @return {string} - The resulting string formatted as "X days".
    */
   static getDaysLeftFromMilliseconds(milliseconds, fallback = "0 days left") {
      if (milliseconds < 0) return fallback
      const days = dayjs.duration(milliseconds).asDays()
      return `${Math.floor(days)} days`
   }

   /**
    * Formats a JavaScript Date object to a string in the format "DD MMM YYYY".
    *
    * @param {Date} JSDate - The JavaScript Date object to be formatted.
    * @return {string} - The formatted date string. Example: "12 Oct 2020".
    */
   static formatDateToDayMonthYear(JSDate: Date) {
      return dayjs(JSDate).format("DD MMM YYYY") // 12 Oct 2020
   }

   /**
    * Determines if the current date has surpassed a given deadline.
    *
    * @param {Date} JSDate - The JavaScript Date object to be compared.
    * @return {boolean} - True if the current date exceeds the deadline.
    */
   static isDeadlineExpired(JSDate: Date) {
      JSDate.setUTCHours(23, 59, 59, 999) // Get end of day
      const now = new Date()
      return now >= JSDate
   }

   /**
    * Formats the elapsed time since a given start point to a string.
    * If more than an hour has passed, it formats the time as "HH:MM:SS".
    * If less than an hour has passed, it formats the time as "MM:SS".
    *
    * @param {number | Date} startedAt - The start time as a timestamp or Date object.
    * @return {string} - The formatted elapsed time.
    */
   static formatElapsedTime(
      startedAt: number | Date,
      endedAt?: number | Date
   ): string {
      const now = dayjs()
      const start = dayjs(startedAt)
      const end = endedAt ? dayjs(endedAt) : now
      const difference = end.diff(start)

      // Calculate total hours, minutes and remaining seconds
      const totalHours = Math.floor(difference / (1000 * 60 * 60))
      const totalMinutes = Math.floor((difference / (1000 * 60)) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      // Format hours, minutes and seconds
      const formattedHours = totalHours.toString().padStart(2, "0")
      const formattedMinutes = totalMinutes.toString().padStart(2, "0")
      const formattedSeconds = seconds.toString().padStart(2, "0")

      if (totalHours > 0) {
         return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
      }

      return `${formattedMinutes}:${formattedSeconds}`
   }

   static getSecondsBetweenDates(startDate: Date, endDate: Date) {
      return (endDate.getTime() - startDate.getTime()) / 1000
   }

   static getMinutesPassed = (date: Date) => {
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      return Math.floor(diff / 1000 / 60)
   }

   /**
    * Formats a given date to a string in the format "DD MMM YYYY at HH:mm".
    *
    * @param {Date} JSDate - The JavaScript Date object to be formatted.
    * @return {string} - The formatted date string.
    */
   static formatDateTime(JSDate: Date | number): string {
      return dayjs(JSDate).format("DD MMM YYYY [at] HH:mm")
   }
}
