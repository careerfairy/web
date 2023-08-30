import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Timestamp } from "../api/firestoreAdmin"

/**
 * Adds the current timestamp to the "addedToFeedAt" field of a spark.
 *
 * @param spark - The spark to which the timestamp will be added
 */
export const addAddedToFeedAt = (spark: Spark) => {
   spark.addedToFeedAt = Timestamp.now()
}
