import { sparksAnalyticsService } from "data/firebase/SparksAnalyticsService"
import useSWR from "swr"

/**
 * Custom hook to fetch the stats of a Spark from Firestore.
 *
 * @param {string} sparkId - The id of the spark.
 * @returns {SparkStats} The SparkStats object from Firestore.
 */

const useSparkStats = (groupId: string, sparkId: string) => {
   const fetcher = async (sparkId: string) => {
      return await sparksAnalyticsService.fetchSparkStats(groupId, sparkId)
   }

   const { data, error, isLoading } = useSWR(
      ["spark-stats", sparkId],
      () => fetcher(sparkId),
      {
         revalidateOnFocus: false,
      }
   )

   return { data, error, isLoading }
}

export default useSparkStats
