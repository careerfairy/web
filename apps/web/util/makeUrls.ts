import { getHost } from "../constants/domains"
import { queryInvite, queryReferralCode } from "../constants/queryStringParams"
import { Group } from "@careerfairy/shared-lib/groups"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"

const makeDuration = function (event) {
   const minutes = Math.floor(
      (+new Date(event.endsAt) - +new Date(event.startsAt)) / 60 / 1000
   )
   return (
      "" +
      ("0" + Math.floor(minutes / 60)).slice(-2) +
      ("0" + (minutes % 60)).slice(-2)
   )
}
const makeTime = function (time) {
   return new Date(time).toISOString().replace(/[-:]|\.\d{3}/g, "")
}
const makeUrl = function (base, query) {
   return Object.keys(query).reduce(function (accum, key, index) {
      const value = query[key]
      if (value !== null) {
         return (
            "" +
            accum +
            (index === 0 ? "?" : "&") +
            key +
            "=" +
            encodeURIComponent(value)
         )
      }
      return accum
   }, base)
}
const makeGoogleCalendarUrl = function (event) {
   return makeUrl("https://calendar.google.com/calendar/render", {
      action: "TEMPLATE",
      dates: makeTime(event.startsAt) + "/" + makeTime(event.endsAt),
      location: event.location,
      text: event.name,
      details: event.details,
   })
}
const makeOutlookCalendarUrl = function (event) {
   return makeUrl("https://outlook.live.com/owa", {
      rru: "addevent",
      startdt: event.startsAt,
      enddt: event.endsAt,
      subject: event.name,
      location: event.location,
      body: event.details,
      allday: false,
      uid: new Date().getTime().toString(),
      path: "/calendar/view/Month",
   })
}
const makeYahooCalendarUrl = function (event) {
   return makeUrl("https://calendar.yahoo.com", {
      v: 60,
      view: "d",
      type: 20,
      title: event.name,
      st: makeTime(event.startsAt),
      dur: makeDuration(event),
      desc: event.details,
      in_loc: event.location,
   })
}
const makeICSCalendarUrl = function (event) {
   const components = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT"]
   // In case of SSR, document won't be defined
   if (typeof document !== "undefined") {
      // remove any hash from the url
      const urlComponent = "URL:" + document.URL.split("#")[0]
      components.push(urlComponent)
   }
   components.push(
      `DTSTART:${makeTime(event.startsAt)}`,
      `DTEND:${makeTime(event.endsAt)}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.details}`,
      `LOCATION:${event.location}`,
      "END:VEVENT",
      "END:VCALENDAR"
   )
   return encodeURI("data:text/calendar;charset=utf8," + components.join("\n"))
}

export const makeUrls = function (event) {
   return {
      google: makeGoogleCalendarUrl(event),
      outlook: makeOutlookCalendarUrl(event),
      yahoo: makeYahooCalendarUrl(event),
      ics: makeICSCalendarUrl(event),
   }
}

export const makeLivestreamEventDetailsUrl = (livestreamId) => {
   return `${getHost()}/portal/livestream/${livestreamId}`
}

export const makeGroupCompanyPageUrl = (group: Group) => {
   return `${getHost()}/company/${companyNameSlugify(group.universityName)}`
}

export const makeLivestreamEventDetailsInviteUrl = (
   livestreamId,
   referralCode
) => {
   return (
      makeLivestreamEventDetailsUrl(livestreamId) +
      `?${queryReferralCode}=${referralCode}&${queryInvite}=${livestreamId}`
   )
}

export const makeReferralUrl = (userReferralCode) => {
   return `${getHost()}/?${queryReferralCode}=${userReferralCode}`
}
