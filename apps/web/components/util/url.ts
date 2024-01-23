export const appendCurrentQueryParams = (url: string) => {
   const queryParams = new URLSearchParams(window.location.search).toString()

   return queryParams ? `${url}?${queryParams}` : url
}
