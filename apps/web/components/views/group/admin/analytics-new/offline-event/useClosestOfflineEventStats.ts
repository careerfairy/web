import { offlineEventService } from "data/firebase/OfflineEventService"
import "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "../../../../../../util/CommonUtil"

type Return = {
   isLoading: boolean // Whether the closest offline event is being fetched
   closestOfflineEventId: string | null // The ID of the closest offline event or null if there are no upcoming or past events
}

type Options = {
   shouldFetch: boolean
} & SWRConfiguration

/**
 * Hook to fetch the closest offline event stats for a group
 *
 * @param {string} groupId - The ID of the group to fetch the offline event stats for
 * @param {boolean} shouldFetch - Whether to fetch the offline event stats or not
 * @returns {Object} An object with isLoading boolean and closestOfflineEventId string or null
 */
const useClosestOfflineEventStats = (
   groupId: string,
   { shouldFetch, ...options }: Options
): Return => {
   const { replace } = useRouter()
   const [isRedirecting, setIsRedirecting] = useState(false)

   const { isLoading, data: closestOfflineEventId } = useSWR(
      shouldFetch
         ? `/group/${groupId}/admin/analytics/offline-event-stats/closest`
         : null,
      async () => fetchClosestOfflineEventId(groupId),
      {
         onError: (error) => {
            errorLogAndNotify(error, {
               title: "Error fetching closest offline event",
               groupId: groupId,
            })
         },
         ...options,
      }
   )

   useEffect(() => {
      if (closestOfflineEventId && shouldFetch) {
         setIsRedirecting(true)

         replace(
            `/group/${groupId}/admin/analytics/offline-events/${
               closestOfflineEventId ?? ""
            }`
         ).then(() => setIsRedirecting(false))
      }
   }, [closestOfflineEventId, groupId, replace, shouldFetch])

   return {
      isLoading: isLoading || isRedirecting,
      closestOfflineEventId: closestOfflineEventId,
   }
}

/**
 * Fetches the closest offline event to the current time for a given group ID.
 *
 * @function
 * @async
 * @param {string} groupId - The ID of the group to fetch the closest offline event for.
 * @returns {Promise<string|null>} - Promise which resolves to the ID of the closest offline event or null if there are no upcoming or past events.
 */
const fetchClosestOfflineEventId = async (
   groupId: string
): Promise<string | null> => {
   const now = new Date()

   const [pastStats, futureStats] = await Promise.all([
      offlineEventService.getClosestPastOfflineEventStatsFromDate(groupId, now),
      offlineEventService.getClosestFutureOfflineEventStatsFromDate(
         groupId,
         now
      ),
   ])

   if (!pastStats && !futureStats) {
      return null
   }

   if (!pastStats) {
      return futureStats.offlineEvent.id
   }

   if (!futureStats) {
      return pastStats.offlineEvent.id
   }

   const nowMillis = now.getTime()

   const pastDiff = nowMillis - pastStats.offlineEvent.startAt.toMillis()
   const futureDiff = futureStats.offlineEvent.startAt.toMillis() - nowMillis
   const closestStats = pastDiff <= futureDiff ? pastStats : futureStats

   return closestStats.offlineEvent.id ?? null
}

export default useClosestOfflineEventStats
