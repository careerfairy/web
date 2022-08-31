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

   static getUpcomingDate(JSDate) {
      return dayjs(JSDate).format("dddd, MMM D, YYYY h:mm A")
   }
   static getStreamTime(JSDate) {
      return dayjs(JSDate).format("hh:ss z")
   }
   static getStreamDate(JSDate) {
      return dayjs(JSDate).format("dddd, MMMM D")
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

   static getMonth(JsDateMonth) {
      switch (JsDateMonth) {
         case 0:
            return "January"
         case 1:
            return "February"
         case 2:
            return "March"
         case 3:
            return "April"
         case 4:
            return "May"
         case 5:
            return "June"
         case 6:
            return "July"
         case 7:
            return "August"
         case 8:
            return "September"
         case 9:
            return "October"
         case 10:
            return "November"
         case 11:
            return "December"
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
}
