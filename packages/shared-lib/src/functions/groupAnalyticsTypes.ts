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
   }

   static serialize(document: UserLivestreamData) {
      const mapped = {
         livestreamId: document.livestreamId,
         registered: {
            date: document.registered?.date?.toMillis(),
            utm: document.registered?.utm,
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
         },
      }

      return Object.assign(new RegistrationSourcesResponseItem(), mapped)
   }
}
