import dayjs from "dayjs"

var calendar = require("dayjs/plugin/calendar")
var advancedFormat = require("dayjs/plugin/advancedFormat")
var utc = require("dayjs/plugin/utc")
var timezone = require("dayjs/plugin/timezone") // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(calendar)

export default class DateUtil {
   static getJobApplicationDate(JSDate) {
      return dayjs(JSDate).format("DD MMM YYYY")
   }
   static getTodaysISODate() {
      let today = new Date()
      let todaysYear = today.getFullYear()
      let todaysMonth =
         today.getMonth() + 1 > 9
            ? today.getMonth() + 1
            : "0" + (today.getMonth() + 1)
      let todaysDate =
         today.getDate() > 9 ? today.getDate() : "0" + today.getDate()
      return todaysYear + "-" + todaysMonth + "-" + todaysDate
   }

   static monthAndDay(date) {
      return dayjs(date).format("MMM DD")
   }
   static eventPreviewDate(JSDate) {
      return dayjs(JSDate).format("MMMM Do, HH:mm")
   }

   static dateWithYear(JSDate) {
      return dayjs(JSDate).format("LL LT") // October 21, 2019 10:00 AM
   }

   static eventPreviewHour(JSDate) {
      return dayjs(JSDate).format("HH:mm")
   }
   static getUpcomingDate(JSDate) {
      return dayjs(JSDate).format("dddd, MMM D, YYYY h:mm A")
   }
   static getStreamTime(JSDate) {
      return dayjs(JSDate).format("hh:ss z")
   }
   static getStreamDate(JSDate) {
      return dayjs(JSDate).format("dddd, MMMM D")
   }
   static getRatingDate(JSDate) {
      return dayjs(JSDate).format("D MMMM YYYY")
   }

   /**
    * Transforms a JavaScript Date object into a string formatted as "DD/MM/YYYY"
    * using the dayjs library.
    *
    * @param {Date} JSDate - The JavaScript Date object to be transformed.
    * @return {string} - The resulting string formatted as "DD/MM/YYYY".
    */
   static formatDateToString(JSDate) {
      return dayjs(JSDate).format("DD/MM/YYYY")
   }

   static eventStartDate(JSDate) {
      return dayjs(JSDate).format("DD/MM/YYYY HH:mm")
   }

   static getRelativeDate(JSDate) {
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

   static getTimeAgo(JSDate) {
      return dayjs(JSDate).fromNow() // 2 hours ago, 2 days ago, 2 months ago, 2 years ago
   }

   static getISODateTime(JSDate) {
      let year = JSDate.getFullYear()
      let month =
         JSDate.getMonth() + 1 > 9
            ? JSDate.getMonth() + 1
            : "0" + (JSDate.getMonth() + 1)
      let day = JSDate.getDate() > 9 ? JSDate.getDate() : "0" + JSDate.getDate()
      let hours =
         JSDate.getHours() > 9 ? JSDate.getHours() : "0" + JSDate.getHours()
      let minutes =
         JSDate.getMinutes() > 9
            ? JSDate.getMinutes()
            : "0" + JSDate.getMinutes()
      let seconds =
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

   static getAddEventDateTime(JSDate) {
      let year = JSDate.getFullYear()
      let month =
         JSDate.getMonth() + 1 > 9
            ? JSDate.getMonth() + 1
            : "0" + (JSDate.getMonth() + 1)
      let day = JSDate.getDate() > 9 ? JSDate.getDate() : "0" + JSDate.getDate()
      let hours =
         JSDate.getHours() > 9 ? JSDate.getHours() : "0" + JSDate.getHours()
      let minutes =
         JSDate.getMinutes() > 9
            ? JSDate.getMinutes()
            : "0" + JSDate.getMinutes()
      let seconds =
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

   static getPrettyDate(JSDate) {
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

   static getPrettyDateWithoutHour(JSDate) {
      return (
         JSDate.getDate() +
         " " +
         DateUtil.getMonth(JSDate.getMonth()) +
         " " +
         JSDate.getFullYear()
      )
   }

   static getPrettyDateShort(JSDate) {
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

   static getPrettyDay(JSDate) {
      return DateUtil.getMonth(JSDate.getMonth()) + " " + JSDate.getDate()
   }

   static getPrettyTime(JSDate) {
      return (
         JSDate.getHours() + ":" + DateUtil.getTimeMinutes(JSDate.getMinutes())
      )
   }

   static getMonth(JsDateMonth, isAbbreviated = false) {
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

   static getDayExtension(JsDateDay) {
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

   static getTimeMinutes(JsTimeMinutes) {
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

   static getDifferenceInDays(dateFrom, dateTo) {
      const differenceInTime = dateTo.getTime() - dateFrom.getTime()
      return differenceInTime / (1000 * 60 * 60 * 24)
   }

   static calculateTimeLeft(time) {
      const difference = time - new Date()
      let timeLeft = {}

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

   static addDaysToDate(date, numberOfDays) {
      const result = date
      result.setDate(date.getDate() + numberOfDays)

      return result
   }

   static formatLiveDate(JSDate) {
      const formattedDate = dayjs(JSDate).format(
         "dddd, DD MMM YYYY [at] h:mm A"
      )
      return `Live on ${formattedDate}` // Live on Monday, 12 Oct 2020 at 12:00 PM
   }

   static formatPastDate(JSDate) {
      const formattedDate = dayjs(JSDate).format("DD MMM YYYY")
      return `Live streamed on: ${formattedDate}` // Release date: 15 Dec 2022
   }
}
