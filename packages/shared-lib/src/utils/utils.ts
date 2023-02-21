import { LivestreamEvent } from "../livestreams"

/*
 *
 * Method gets a nested property based on a string path
 *  - const obj = {prop1: {prop2:{prop3: "dog"}}}
 *  - getNestedProperty(obj, "prop1.prop2.prop3") returns "dog"
 * */
export const getNestedProperty = (
   obj: any,
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
 * Sort Livestreams from more recent to oldest
 * @param a
 * @param b
 * @param reverse ascending ordering
 */
export const sortLivestreamsDesc = (
   a: LivestreamEvent,
   b: LivestreamEvent,
   reverse = false
): number => {
   let aa = reverse ? b : a
   let bb = reverse ? a : b

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
 * To slugify any string
 */
const slugify = (text: string): string => {
   return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
}

type AddUtmTagsToLinkProps = {
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

/**
 * Round a number and limit the decimal places
 */
export const round = (num: number, decimalPlaces: number): number => {
   let f = Math.pow(10, decimalPlaces)
   return Math.round((num + Number.EPSILON) * f) / f
}
export const removeSpecialChars = (str: string) => {
   return str.replace(/[^a-zA-Z ]/g, "")
}
