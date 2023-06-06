import { ParsedUrlQuery } from "querystring"

/**
 * Check path is from an admin journey
 *  if no pathname provided, uses the window object
 */
export const isGroupAdminPath = (pathname?: string): boolean => {
   let path = pathname ?? getWindow()?.location?.pathname

   const paths = [
      /^\/group\/\[groupId\]/, // nextjs pathname
      /^\/group\/\w+/, // window.location.pathname
      /^\/signup-admin/,
   ]

   return paths.some((r) => r.test(path))
}

/**
 * Check path is from a streaming journey
 *  if no pathname provided, uses the window object
 */
export const isStreamingPath = (pathname?: string): boolean => {
   let path = pathname ?? getWindow()?.location?.pathname

   const paths = [/^\/streaming\/.+/]

   return paths.some((r) => r.test(path))
}

/**
 * Check if current url is from a recording session
 *  if no queryString param is provided, it uses the window object
 */
export const isRecordingWindow = (queryString?: string) => {
   // we don't care about the value, can be true, false, etc
   return queryStringExists("isRecordingWindow", queryString)
}

/**
 * Check if a query string contains a key
 *  if no query string provided, it uses the window object
 */
export const queryStringExists = (name: string, queryString?: string) => {
   const qs = queryString ?? getWindow()?.location?.search

   if (qs) {
      const params = new URLSearchParams(qs)

      return params.has(name)
   }

   return false
}

/**
 * Check if a path is from an embedded page
 *
 * If no pathname provided, uses the window object
 */
export const isEmbedded = (pathname?: string) => {
   let path = pathname ?? getWindow()?.location?.pathname

   return path?.endsWith("/embed")
}

/**
 * Returns window object or null
 */
export const getWindow = () => {
   if (typeof window !== "undefined") {
      return window
   }

   return null
}

/**
 * Check if the query params indicate that the user is coming from the newsletter
 */
export const isFromNewsletter = (query: ParsedUrlQuery) => {
   return (
      query?.utm_source === "careerfairy" &&
      query?.utm_medium === "email" &&
      query?.utm_campaign === "newsletter"
   )
}
