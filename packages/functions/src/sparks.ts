import {
   Spark,
   sortSeenSparks,
   sortSparksByIds,
} from "@careerfairy/shared-lib/sparks/sparks"
import { sparkRepo, userRepo } from "./api/repositories"

export const getUserWatchedSparks = async (
   userEmail: string,
   limit: number
): Promise<Spark[]> => {
   const seenSparks = await userRepo.getUserSeenSparks(userEmail)

   if (!seenSparks) return []

   const sparkIds = sortSeenSparks(seenSparks, limit)

   const sparks = (await sparkRepo.getSparksByIds(sparkIds)) || []

   // Re sort ensuring order stays the same after fetching data
   const sortedSparks = sortSparksByIds(sparkIds, sparks)

   // Leaving const to allow debugging
   return sortedSparks
}
