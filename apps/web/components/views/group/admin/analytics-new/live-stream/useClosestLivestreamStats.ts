import "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR, { SWRConfiguration } from "swr"
import { livestreamRepo } from "../../../../../../data/RepositoryInstances"
import { errorLogAndNotify } from "../../../../../../util/CommonUtil"

type Return = {
   isLoading: boolean // Whether the closest livestream is being fetched
   closestLivestreamId: string | null // The ID of the closest livestream or null if there are no upcoming or past livestreams
}

type Options = {
   shouldFetch: boolean
} & SWRConfiguration

/**
 * Hook to fetch the closest livestream stats for a group
 *
 * @param {string} groupId - The ID of the group to fetch the livestream stats for
 * @param {boolean} shouldFetch - Whether to fetch the livestream stats or not
 * @returns {Object} An object with isLoading boolean and closestLivestreamId string or null
 */
const useClosestLivestreamStats = (
   groupId: string,
   { shouldFetch, ...options }: Options
): Return => {
   const { replace } = useRouter()
   const [isRedirecting, setIsRedirecting] = useState(false)

   const { isLoading, data: closestLivestreamId } = useSWR(
      shouldFetch
         ? `/group/${groupId}/admin/analytics/live-stream-stats/closest`
         : null,
      async () => fetchClosestLivestreamId(groupId),
      {
         onError: (error) => {
            errorLogAndNotify(error, {
               title: "Error fetching closest livestream",
               groupId: groupId,
            })
         },
         ...options,
      }
   )

   useEffect(() => {
      if (closestLivestreamId && shouldFetch) {
         setIsRedirecting(true)

         replace(
            `/group/${groupId}/admin/analytics/live-streams/${
               closestLivestreamId ?? ""
            }`
         ).then(() => setIsRedirecting(false))
      }
   }, [closestLivestreamId, groupId, replace, shouldFetch])

   return {
      isLoading: isLoading || isRedirecting,
      closestLivestreamId: closestLivestreamId,
   }
}

/**
 * Fetches the closest livestream to the current time for a given group ID.
 *
 * @function
 * @async
 * @param {string} groupId - The ID of the group to fetch the closest livestream for.
 * @returns {Promise<string|null>} - Promise which resolves to the ID of the closest livestream or null if there are no upcoming or past livestreams.
 */
const fetchClosestLivestreamId = async (
   groupId: string
): Promise<string | null> => {
   const now = new Date()

   const [pastStats, futureStats] = await Promise.all([
      livestreamRepo.getClosestPastLivestreamStatsFromDate(groupId, now),
      livestreamRepo.getClosestFutureLivestreamStatsFromDate(groupId, now),
   ])

   if (!pastStats && !futureStats) {
      return null
   }

   if (!pastStats) {
      return futureStats.livestream.id
   }

   if (!futureStats) {
      return pastStats.livestream.id
   }

   const nowMillis = now.getTime()

   const pastDiff = nowMillis - pastStats.livestream.start.toMillis()
   const futureDiff = futureStats.livestream.start.toMillis() - nowMillis
   const closestDoc = pastDiff <= futureDiff ? pastStats : futureStats

   return closestDoc.livestream.id ?? null
}

export default useClosestLivestreamStats
