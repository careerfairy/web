import LocalStorageUtil from "./LocalStorageUtil"
import { dynamicSort } from "@careerfairy/shared-lib/dist/utils"
import * as Sentry from "@sentry/nextjs"

export function getRandom(arr, n) {
   var result = new Array(n),
      len = arr.length,
      taken = new Array(len)
   if (n > len) return arr
   while (n--) {
      var x = Math.floor(Math.random() * len)
      result[n] = arr[x in taken ? taken[x] : x]
      taken[x] = --len in taken ? taken[len] : len
   }
   return result
}

export function getMaxSlides(intendedSlidesToShow, numberOfElements) {
   if (intendedSlidesToShow > numberOfElements) {
      return numberOfElements
   } else {
      return intendedSlidesToShow
   }
}

/**
 * @param {number|string|VarDate|Date} streamStartDate -  Date
 * @param {number} minimumTimeElapsed - Minimum time (minutes) that must have passed since the start of the stream
 */
export function streamIsOld(streamStartDate, minimumTimeElapsed = 120) {
   if (!streamStartDate) return false

   let streamDate
   if (typeof streamStartDate.toDate === "function") {
      streamDate = streamStartDate.toDate() // firestore timestamp conversion
   } else {
      streamDate = new Date(streamStartDate)
   }

   const now = new Date()
   // @ts-ignore
   const timeElapsed = now - streamDate
   return timeElapsed > minimumTimeElapsed * 60 * 1000
}

/**
 * @param {Date} date - input date
 */
export function dateIsInUnder24Hours(date) {
   return (
      new Date(date).getTime() - Date.now() < 1000 * 60 * 60 * 24 ||
      Date.now() > new Date(date).getTime()
   )
}

/**
 * Get referralCode and livestreamId invitation from localstorage
 */
export function getReferralInformation() {
   try {
      if (typeof window !== "undefined") {
         return {
            referralCode: LocalStorageUtil.getReferralCode(),
            inviteLivestream: LocalStorageUtil.getInviteLivestream(),
         }
      }
   } catch (e) {
      console.error(e)
      return null
   }

   return null
}

/**
 * Get list separator character from OS Regional Settings
 *
 * Useful to generate csv files
 * @returns {string}
 */
export function getListSeparator() {
   let list = ["a", "b"],
      str
   if (list.toLocaleString) {
      str = list.toLocaleString()
      if (str.indexOf(";") > 0 && str.indexOf(",") === -1) {
         return ";"
      }
   }
   return ","
}

/**
 * We need to use the opposite list separator char for the csv
 * @returns {string}
 */
export function getCSVDelimiterBasedOnOS() {
   const separator = getListSeparator()

   return separator === "," ? ";" : ","
}

export const getQueryStringFromUrl = (url = "", queryParam = "") => {
   let params = new URL(url).searchParams
   return params.get(queryParam)
}

export function stringToColor(string: string) {
   let hash = 0
   let i

   /* eslint-disable no-bitwise */
   for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
   }

   let color = "#"

   for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff
      color += `00${value.toString(16)}`.slice(-2)
   }
   /* eslint-enable no-bitwise */

   return color
}
const removeSpecialChars = (str: string) => {
   return str.replace(/[^a-zA-Z ]/g, "")
}
/*
 * inspired from the stackoverflow [answer](https://stackoverflow.com/questions/33076177/getting-name-initials-using-js#answer-63763497)
 * */
const getInitials = (fullName: string) => {
   return (
      removeSpecialChars(fullName)
         .match(/(^\S\S?|\s\S)?/g)
         .map((v) => v.trim())
         .join("")
         .match(/(^\S|\S$)?/g)
         .join("")
         .toLocaleUpperCase() || "A" // if no initials found, return A
   )
}
export function stringAvatar(firstName: string, lastName: string) {
   let name = ""
   // we trim the last name to avoid
   // too initials for the avatar component causing an ugly overflow
   // before: "${John Doe} ${Bane Philip}" -> "JDBP"
   // Now: "${John Doe} ${Dane Philip}" -> "JD"
   if (firstName) {
      name += firstName.trim()
   }

   if (lastName) {
      name += ` ${lastName.trim()}`
   }
   if (!name.trim()) {
      name = "Anonymous"
   }
   const initials = getInitials(`${firstName || ""} ${lastName || ""}`)

   return {
      sx: {
         bgcolor: stringToColor(name),
      },
      children: initials,
   }
}

export const getMillisecondsBetweenDates = (date1: Date, date2: Date) => {
   return Math.abs(date1.getTime() - date2.getTime())
}

export const convertMillisecondsToTime = (milliseconds: number) => {
   const seconds = milliseconds / 1000
   const minutes = seconds / 60
   const hours = minutes / 60
   const days = hours / 24
   const years = days / 365

   if (years > 1) {
      return `${Math.round(years)} years`
   } else if (days > 1) {
      return `${Math.round(days)} days`
   } else if (hours > 1) {
      return `${Math.round(hours)} hours`
   } else if (minutes > 1) {
      return `${Math.round(minutes)} minutes`
   } else {
      return `${Math.round(seconds)} seconds`
   }
}

// returns an array of elements with duplicate properties
export const findElementsWithDuplicatePropertiesInArray = <T>(
   elements: T[],
   properties: Array<keyof T>,
   sortBy: keyof T
): T[] => {
   const getPropertyString = (element: T) =>
      properties.map((p) => element[p]).join("")
   const duplicateProperties = elements
      .map((v) => `${getPropertyString(v)}`) // convert element to a string of properties
      .filter(
         (propertyValue, i, arrayOfPropertyValues) =>
            propertyValue && arrayOfPropertyValues.indexOf(propertyValue) !== i
      )
   return elements
      .filter((obj) => duplicateProperties.includes(getPropertyString(obj)))
      .sort(dynamicSort(sortBy))
}

export const capitalizeFirstLetter = (string: string) => {
   if (!string) return string
   return string.charAt(0).toUpperCase() + string.slice(1)
}

export const errorLogAndNotify = (error: Error, metadata?: any) => {
   console.error("error", error)
   Sentry.captureException(error, metadata)
}
/**
 * Check if the emulators are enabled or if we're running locally
 */
export const shouldUseEmulators = () => {
   return false
   if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
      return true
   }

   if (typeof window !== "undefined") {
      if (
         location.hostname === "localhost" ||
         location.hostname === "127.0.0.1"
      ) {
         return true
      }
   }

   return false
}

export const getDictValues = <K extends keyof any, T>(
   valueKeys: K[],
   dict: Record<K, T>
): T[] => {
   return valueKeys?.length
      ? valueKeys.map((stepId) => dict[stepId]).filter(Boolean)
      : Object.values(dict)
}

/**
 * Check if the browser is from a mobile device
 */
export const isMobileBrowser = () => {
   const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i]

   return toMatch.some((toMatchItem) => {
      return navigator?.userAgent?.match(toMatchItem)
   })
}

/**
 * To scroll to the top of the page
 */
export const scrollTop = () => {
   window.scrollTo({ top: 0, behavior: "smooth" })
}

/**
 * Calculate a sha1 hash using the Browser APIs
 *
 * Useful to generate cache keys used by our cloud functions
 */
export const sha1 = async (str: string) => {
   const buffer = new TextEncoder().encode(str)
   const hash = await crypto.subtle.digest("SHA-1", buffer)
   const hexCodes = []
   const view = new DataView(hash)
   for (let i = 0; i < view.byteLength; i += 1) {
      const byte = view.getUint8(i).toString(16).padStart(2, "0")
      hexCodes.push(byte)
   }

   return hexCodes.join("")
}
