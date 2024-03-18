/**
 * Appends the current query parameters to the given URL.
 * If a query parameter already exists in the URL, it will be replaced by the current one.
 *
 * @param {string} url - The base URL to which the current query parameters will be appended.
 * @returns {string} - The full URL with the current query parameters appended.
 */
export const appendCurrentQueryParams = (url: string) => {
   const currentParams = new URLSearchParams(window.location.search)
   const fullUrl = new URL(url, window.location.origin)

   for (const [key, value] of currentParams) {
      fullUrl.searchParams.set(key, value) // Existing query params in the URL are replaced by the current ones if they match.
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
