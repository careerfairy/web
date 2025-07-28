import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"

export const getEventDate = (stat: LiveStreamStats): string => {
   if (!stat.livestream.start) {
      return "No date"
   }

   const date = stat.livestream.start.toDate()
   const day = date.getDate().toString().padStart(2, "0")
   const month = date.toLocaleDateString("en-US", { month: "short" })
   const year = date.getFullYear().toString().slice(-2)
   const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
   })

   return `${day} ${month} ${year}, ${time}`
}
