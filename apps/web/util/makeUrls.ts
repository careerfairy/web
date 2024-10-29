import { Group } from "@careerfairy/shared-lib/groups"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import {
   getHost,
   makeLivestreamEventDetailsUrl,
} from "@careerfairy/shared-lib/utils/urls"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { queryInvite, queryReferralCode } from "../constants/queryStringParams"
import { errorLogAndNotify } from "./CommonUtil"

export type CalendarEvent = {
   startsAt: string
   endsAt: string
   name: string
   details: string
   location: string
}

const makeDuration = function (event: CalendarEvent): string {
   const minutes = Math.floor(
      (+new Date(event.endsAt) - +new Date(event.startsAt)) / 60 / 1000
   )
   return (
      "" +
      ("0" + Math.floor(minutes / 60)).slice(-2) +
      ("0" + (minutes % 60)).slice(-2)
   )
}
const makeTime = function (time: string): string {
   return new Date(time).toISOString().replace(/[-:]|\.\d{3}/g, "")
}
const makeUrl = function (
   base: string,
   query: Record<string, string | null | number | boolean>
): string {
   return Object.keys(query).reduce(function (accum, key, index) {
      const value = query[key]
      if (value !== null) {
         let encodedValue = ""

         try {
            encodedValue = encodeURIComponent(value)
         } catch (error) {
            errorLogAndNotify(error)
            throw error
         }

         return (
            "" + accum + (index === 0 ? "?" : "&") + key + "=" + encodedValue
         )
      }
      return accum
   }, base)
}
const makeGoogleCalendarUrl = function (event: CalendarEvent): string {
   return makeUrl("https://calendar.google.com/calendar/render", {
      action: "TEMPLATE",
      dates: makeTime(event.startsAt) + "/" + makeTime(event.endsAt),
      location: event.location,
      text: event.name,
      details: event.details,
   })
}
const makeOutlookCalendarUrl = function (event: CalendarEvent): string {
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
const makeYahooCalendarUrl = function (event: CalendarEvent): string {
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
const makeICSCalendarUrl = function (event: CalendarEvent): string {
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

export const makeUrls = function (event: CalendarEvent): {
   google: string
   outlook: string
   yahoo: string
   ics: string
} {
   return {
      google: makeGoogleCalendarUrl(event),
      outlook: makeOutlookCalendarUrl(event),
      yahoo: makeYahooCalendarUrl(event),
      ics: makeICSCalendarUrl(event),
   }
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

type LivestreamURLOptions = {
   type: "host" | "viewer"
   token?: string
   referralCode?: string
   inviteCode?: string
}

export const makeLivestreamUrl = (
   livestreamId: string,
   options?: LivestreamURLOptions
) => {
   const url = new URL(
      `${getBaseUrl()}/streaming/${options.type}/${livestreamId}`
   )
   const params = new URLSearchParams(url.search)

   if (options.token) {
      params.set("token", options.token)
   }
   if (options.referralCode) {
      params.set("referral", options.referralCode)
   }
   if (options.inviteCode) {
      params.set("invite", options.inviteCode)
   }

   url.search = params.toString()

   return url.toString()
}
