import { UTMParams } from "../commonTypes"
import { UserLivestreamData } from "../livestreams"

/**
 * Response type for the getRegistrationSources function
 * groupAnalytics.ts
 */
export class RegistrationSourcesResponseItem {
   public livestreamId: string
   public registered: {
      date?: Date
      utm?: UTMParams
      sparkId?: string
   }

   static serialize(document: UserLivestreamData) {
      const mapped = {
         livestreamId: document.livestreamId,
         registered: {
            date: document.registered?.date?.toMillis(),
            utm: document.registered?.utm,
            sparkId: document.registered?.sparkId,
         },
      }

      return Object.assign(new RegistrationSourcesResponseItem(), mapped)
   }

   static deserialize(obj: RegistrationSourcesResponseItem) {
      const mapped = {
         ...obj,
         registered: {
            date: obj.registered?.date ? new Date(obj.registered?.date) : null,
            utm: obj.registered?.utm,
            sparkId: obj.registered?.sparkId,
         },
      }

      return Object.assign(new RegistrationSourcesResponseItem(), mapped)
   }
}

export const FETCH_TYPES = ["ALL_LIVESTREAMS"] as const

export interface GetRegistrationSourcesFnArgs {
   groupId: string

   /**
    * If provided, the livestreamIds array will be ignored
    */
   fetchType?: (typeof FETCH_TYPES)[number]

   livestreamIds?: string[]
}

/**
 * Generate cache key for the fn call
 */
export const registrationSourcesCacheKey = (
   args: GetRegistrationSourcesFnArgs
) => {
   return [
      "getRegistrationSources",
      args.groupId,
      args.fetchType,
      args.livestreamIds,
   ]
}
