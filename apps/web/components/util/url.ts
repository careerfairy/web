/**
 * Appends the current query parameters to the given URL.
 * If a query parameter already exists in the URL, it will be replaced by the current one.
 *
 * @param {string} url - The base URL to which the current query parameters will be appended.
 * @param {string[]} exclude - The key parameters to exclude from appending. Defaults to none.
 * @param {string[]} includeOnly - The key parameters to include. If provided, only these parameters will be appended. Defaults to none (include all except excluded).
 * @returns {string} - The full URL with the current query parameters appended.
 */
export const appendCurrentQueryParams = (
   url: string,
   exclude: string[] = [],
   includeOnly?: string[]
) => {
   const currentParams = new URLSearchParams(window.location.search)
   const fullUrl = new URL(url, window.location.origin)

   for (const [key, value] of currentParams) {
      // If 'only' is specified, only include those parameters
      if (includeOnly) {
         if (includeOnly.includes(key) && !exclude.includes(key)) {
            fullUrl.searchParams.set(key, value)
         }
      } else {
         // Otherwise, include all parameters except excluded ones
         if (!exclude.includes(key)) {
            fullUrl.searchParams.set(key, value)
         }
      }
   }

   return fullUrl.toString()
}

export const getServerSideBaseUrl = (req) => {
   // Check for the X-Forwarded-Proto header to determine the protocol
   const protocol = req.headers["x-forwarded-proto"] || "https"
   // Use the Host header to get the host and possibly the port
   const host = req.headers.host

   return `${protocol}://${host}`
}
