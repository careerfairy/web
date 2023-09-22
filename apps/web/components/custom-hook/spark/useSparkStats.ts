import { SparkStats } from "@careerfairy/shared-lib/sparks/sparks"

import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Custom hook to fetch the stats of a Spark from Firestore.
 *
 * @param {string} sparkId - The id of the spark.
 * @returns {SparkStats} The SparkStats object from Firestore.
 */

const useSparkStats = (sparkId: string) => {
   return useFirestoreDocument<SparkStats>("sparkStats", [sparkId])
}

export default useSparkStats
