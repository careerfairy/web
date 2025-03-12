import { Identifiable } from "@careerfairy/webapp/types/commonTypes"
import { LivestreamEvent } from "../livestreams"
import { SparkStats } from "../sparks/sparks"
import {
   EventProperties,
   generateCalendarEventProperties,
} from "./calendarEvents"

export type CalendarEvent = {
   startsAt: string
   endsAt: string
   name: string
   details: string
   location: string
}

/*
 *
 * Method gets a nested property based on a string path
 *  - const obj = {prop1: {prop2:{prop3: "dog"}}}
 *  - getNestedProperty(obj, "prop1.prop2.prop3") returns "dog"
 * */
export const getNestedProperty = (
   obj: unknown,
   path: string | string[],
   separator = "."
) => {
   const properties = Array.isArray(path) ? path : path.split(separator)
   return properties.reduce((prev, curr) => prev && prev[curr], obj)
}
/**
 * @description
 * - Returns a function which will sort an
 * array of objects by the given key.
 * - [{id: 3}, {id: 1}, {id: 2}].sort(dynamicSort("id", "desc"))
 * - returns [{id: 3}, {id: 2}, {id: 1}]
 *
 * @param  {String}  property
 * @param  {"asc" | "desc"} order
 * @return {Function}
 */
export const dynamicSort = <T>(property: keyof T, order?: "asc" | "desc") => {
   let sortOrder = 1
   if (order === "desc") {
      sortOrder = -1
   }
   return function (a: T, b: T) {
      if (a[property] < b[property]) {
         return -1 * sortOrder
      }
      if (a[property] > b[property]) {
         return sortOrder
      }
      return 0
   }
}
/**
 * @description
 * Splits an array into chunks of a given size
 * @param list
 * @param chunk
 */
export const chunkArray = <T>(list: T[], chunk: number): T[][] => {
   const result: T[][] = []

   for (let i = 0; i < list.length; i += chunk) {
      result.push(list.slice(i, i + chunk))
   }

   return result
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @template T
 * @param {T[]} array - The array to be shuffled.
 */
export const shuffle = <T>(array: T[]) => {
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
   }
}

/**
 * Sort Livestreams from more recent to oldest
 * @param a
 * @param b
 * @param reverse ascending ordering
 */
export const sortLivestreamsDesc = (
   a: Pick<LivestreamEvent, "start">,
   b: Pick<LivestreamEvent, "start">,
   reverse = false
): number => {
   const aa = reverse ? b : a
   const bb = reverse ? a : b

   if (aa.start instanceof Date && bb.start instanceof Date) {
      return bb.start.getTime() - aa.start.getTime()
   }

   if (aa.start?.["toDate"] && bb.start?.["toDate"]) {
      // convert from firebase timestamp type
      return bb.start.toDate().getTime() - aa.start.toDate().getTime()
   }

   return 0
}

/**
 * Sort Spark Stats from more recent to oldest
 * @param a
 * @param b
 * @param ascending ordering
 */
export const sortSparkStats = (
   a: SparkStats,
   b: SparkStats,
   ascending = false
): number => {
   const aa = ascending ? b : a
   const bb = ascending ? a : b

   if (
      aa.spark.createdAt instanceof Date &&
      bb.spark.createdAt instanceof Date
   ) {
      return bb.spark.createdAt.getTime() - aa.spark.createdAt.getTime()
   }

   return 0
}

/**
 * Sort by popularity if both documents have a popularity value
 * Otherwise keeps the current order
 */
export const sortDocumentByPopularity = <T extends { popularity?: number }>(
   a: T,
   b: T
): number => {
   if (Boolean(b.popularity) && Boolean(a.popularity)) {
      return b.popularity - a.popularity
   }

   return 0
}

/**
 * To slugify any string
 */
export const slugify = (text: string): string => {
   return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
}

export const companyNameSlugify = (text: string): string => {
   return encodeURIComponent(
      text.trim().replace(/ /g, "_") // Replace all " " with "_"
   )
}

export const companyNameUnSlugify = (text: string): string => {
   return decodeURIComponent(
      text.trim().replace(/_/g, " ") // Replace all "_" with " "
   )
}

export type AddUtmTagsToLinkProps = {
   link: string
   source?: string
   medium?: string
   campaign?: string
   content?: string
}

/**
 * To add UTM tags to any link
 */
export const addUtmTagsToLink = ({
   link,
   source = "careerfairy",
   medium = "email",
   campaign,
   content,
}: AddUtmTagsToLinkProps): string => {
   const url = new URL(link)
   const params = new URLSearchParams(url.search)

   if (!params.get("utm_source")) {
      params.set("utm_source", slugify(source))
   }
   if (!params.get("utm_medium")) {
      params.set("utm_medium", slugify(medium))
   }
   if (!params.get("utm_campaign") && campaign) {
      params.set("utm_campaign", slugify(campaign))
   }
   if (!params.get("utm_content") && content) {
      params.set("utm_content", slugify(content))
   }

   url.search = params.toString()

   return url.toString()
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
   query: Record<string, string | null | number | boolean>,
   errorLogAndNotify?: (error: Error) => void
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

const makeGoogleCalendarUrl = function (
   event: CalendarEvent,
   errorLog?: (error: Error) => void
): string {
   return makeUrl(
      "https://calendar.google.com/calendar/render",
      {
         action: "TEMPLATE",
         dates: makeTime(event.startsAt) + "/" + makeTime(event.endsAt),
         location: event.location,
         text: event.name,
         details: event.details,
      },
      errorLog
   )
}

const makeOutlookCalendarUrl = function (
   event: CalendarEvent,
   errorLog?: (error: Error) => void
): string {
   return makeUrl(
      "https://outlook.live.com/owa",
      {
         rru: "addevent",
         startdt: event.startsAt,
         enddt: event.endsAt,
         subject: event.name,
         location: event.location,
         body: event.details,
         allday: false,
         uid: new Date().getTime().toString(),
         path: "/calendar/view/Month",
      },
      errorLog
   )
}

const makeYahooCalendarUrl = function (
   event: CalendarEvent,
   errorLog?: (error: Error) => void
): string {
   return makeUrl(
      "https://calendar.yahoo.com",
      {
         v: 60,
         view: "d",
         type: 20,
         title: event.name,
         st: makeTime(event.startsAt),
         dur: makeDuration(event),
         desc: event.details,
         in_loc: event.location,
      },
      errorLog
   )
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

export const makeUrls = function (
   event: CalendarEvent,
   errorLog?: (error: Error) => void
): {
   google: string
   outlook: string
   yahoo: string
   ics: string
} {
   return {
      google: makeGoogleCalendarUrl(event, errorLog),
      outlook: makeOutlookCalendarUrl(event, errorLog),
      yahoo: makeYahooCalendarUrl(event, errorLog),
      ics: makeICSCalendarUrl(event),
   }
}

type GetLivestreamICSDownloadUrlOptions = {
   utmCampaign?: string
}

export const getLivestreamICSDownloadUrl = (
   streamId: string,
   isLocal: boolean,
   options: GetLivestreamICSDownloadUrlOptions = {}
) => {
   const utmCampaignQueryParam = options.utmCampaign
      ? `&utm_campaign=${options.utmCampaign}`
      : ""

   return isLocal
      ? `http://127.0.0.1:5001/careerfairy-e1fd9/europe-west1/getLivestreamICalendarEvent_v3?eventId=${streamId}${utmCampaignQueryParam}`
      : `https://europe-west1-careerfairy-e1fd9.cloudfunctions.net/getLivestreamICalendarEvent_v3?eventId=${streamId}${utmCampaignQueryParam}`
}

type OptionsCreateCalendarEvent = {
   overrideBaseUrl?: string
}

export const createCalendarEvent = (
   livestream: EventProperties,
   customUtm?: Partial<AddUtmTagsToLinkProps>,
   options?: OptionsCreateCalendarEvent
) => {
   if (!livestream) return null

   const calendarEventProps = generateCalendarEventProperties(
      livestream,
      customUtm,
      options
   )

   return {
      name: calendarEventProps.summary,
      details: calendarEventProps.description,
      location: calendarEventProps.location,
      startsAt: calendarEventProps.start.toISOString(),
      endsAt: calendarEventProps.end.toISOString(),
   }
}

/**
 * Round a number and limit the decimal places
 */
export const round = (num: number, decimalPlaces: number): number => {
   if (isNaN(num)) return num

   const f = Math.pow(10, decimalPlaces)
   return Math.round((num + Number.EPSILON) * f) / f
}

/**
 * To check if some values of one array are contained in another array
 */
export const containsAny = (source: string[], target: string[]): boolean => {
   return source?.some((item) => target?.includes(item))
}

export const arrayContainsAny = <Type>(
   source: Type[],
   target: Type[]
): boolean => {
   return source?.some((item) => target?.includes(item))
}
/**
 * Remove duplicates values
 * @param arr
 */
export const removeDuplicates = <T>(arr: T[]): T[] => {
   return Array.from(new Set(arr))
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

/**
 * @description
 * Creates a lookup object from an array of objects based on the given property name.
 * The resulting object has the IDs of the objects as keys and the property value as values.
 *
 * @param  array - The array of objects to create the lookup from.
 * @param  propertyName - The name of the property to use as the lookup value.
 * @return The lookup object.
 */
export const createLookup = <T extends Identifiable>(
   array: T[],
   propertyName: keyof T
): Record<string, T[keyof T]> => {
   if (!array) return {}
   return array.reduce((acc, curr) => {
      acc[curr.id] = curr[propertyName]
      return acc
   }, {})
}

export const getSubstringWithEllipsis = (text: string, maxLength: number) => {
   const ellipsis = "..."
   if (text.length <= maxLength) {
      return text
   }
   return text.substring(0, maxLength - ellipsis.length) + ellipsis
}

export const queryParamToArr = (
   queryParam: string | string[] | undefined
): string[] => {
   if (!queryParam) return []
   if (Array.isArray(queryParam)) return queryParam.sort()
   return queryParam.split(",").map(decodeURIComponent).sort() // to make sure the order is always the same for caching the key
}

export const queryParamToBool = (
   queryParam: string | string[] | undefined
): boolean => {
   if (!queryParam || Array.isArray(queryParam)) return false
   return queryParam?.toLowerCase() === "true" || false
}

/**
 * Checks whether a given set of Query String filters, are within the imposed limit by Firestore
 * when used in queries. Applying only to filters of Collection type. To prevent a query from becoming too computationally expensive,
 * Cloud Firestore limits a query to a maximum of 30 disjunctions in disjunctive normal form.
 * @see https://firebase.google.com/docs/firestore/query-data/queries?hl=en#limits_on_or_queries
 * @param limit Limit imposed by Firestore.
 * @param filters Collection of Arrays of various filters of any type, where only the length of each
 * Array in the collection @param filters is taken into consideration for limit check.
 * @returns Boolean indicating whether the provided @param filters, given the length of each individual collection it
 * holds, will exceed or not, the imposed @param limit .
 */
export const isWithinNormalizationLimit = (
   limit: number,
   ...filters: Array<Array<unknown>>
): boolean => {
   // Filter empty collections, would result in zero multiplication
   // Map the collection to lengths for calculation
   const sanitizedFilters = filters
      .filter((items) => Boolean(items.length))
      .map((items) => items.length)

   return (
      sanitizedFilters.reduce((previous, current) => previous * current, 1) <
      limit
   )
}

/**
 * Swaps the positions of two elements in an array. This function mutates the original array.
 * @param {T[]} array - The array containing the elements to swap.
 * @param {number} indexA - The index of the first element to swap.
 * @param {number} indexB - The index of the second element to swap.
 * @returns {T[]} The original array (not copy) with the elements swapped.
 */
export const swapPositions = <T>(
   array: T[],
   indexA: number,
   indexB: number
): T[] => {
   const temp = array[indexA]
   array[indexA] = array[indexB]
   array[indexB] = temp
   return array
}
// Calculate difference between two dates in days while taking into consideration the time
export const getDateDifferenceInDays = (
   dateFrom: Date,
   dateTo: Date
): number => {
   const diff = Math.abs(dateFrom.getTime() - dateTo.getTime())
   const diffDays = Math.ceil(diff / (1000 * 3600 * 24))
   return diffDays
}

/**
 * Checks if a value is both defined and strictly equal to another value.
 * @param value - The value to check.
 * @param  toCompare - The value to compare against.
 * @returns True if `value` is defined and strictly equals `toCompare`, otherwise false.
 */
export const isDefinedAndEqual = <T>(
   value: T | undefined,
   toCompare: T
): boolean => {
   return value !== undefined && value === toCompare
}

/**
 * Returns the difference between two arrays as a new array, containing only the differing elements.
 * @param array1 Base array for difference
 * @param array2 Comparison array to be used against @param array1 (Base) for differences
 * @returns New array containing only differing elements
 */
export const getArrayDifference = (array1: unknown[], array2: unknown[]) => {
   if (!array1?.length) return array2 ?? []

   if (!array2?.length) return array1 ?? []

   return array2.filter((element) => {
      return !array1.includes(element)
   })
}

/**
 * Returns a new sorted array taken into consideration an index getter function. The items position
 * are determined by the number value returned by @param getIndexOf.
 * @param array Base array for sorting
 * @param getIndexOf Function which receives an item and returns its supposed index
 * @returns New sorted array
 */
export const arraySortByIndex = <T>(
   array: T[],
   getIndexOf: (item: T) => number
): T[] => {
   const sortedItems = array.sort((baseItem, comparisonItem) => {
      const baseSortedIndex = getIndexOf(baseItem)
      const comparisonSortedIndex = getIndexOf(comparisonItem)

      return baseSortedIndex - comparisonSortedIndex
   })
   return sortedItems
}
