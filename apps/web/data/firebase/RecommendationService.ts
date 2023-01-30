import { pickPublicDataFromUser, UserData } from "@careerfairy/shared-lib/users"
import {
   PopularityEventType,
   PopularityEventData,
   PopularityEventTypes,
} from "@careerfairy/shared-lib/livestreams/popularity"
import { doc, Firestore, serverTimestamp, setDoc } from "firebase/firestore"
import { FirestoreInstance } from "./FirebaseInstance"
import {
   LivestreamEvent,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/livestreams"

export class RecommendationService {
   constructor(private readonly firestore: Firestore) {}

   /**
    * Adds a popularity event to the database
    *
    * A promise will be created but not awaited
    *
    * @param livestream - Livestream object
    * @param type - Popularity event type
    */
   addPopularityEvent(
      type: PopularityEventType,
      livestream: LivestreamEvent,
      options?: AddPopularityEventOptions
   ): void {
      const data: Omit<PopularityEventData, "id"> = {
         type,
         createdAt: serverTimestamp() as any,

         livestreamId: livestream.id,
         livestream: pickPublicDataFromLivestream(livestream),

         points: this.getPoints(type),
      }

      if (options?.user) {
         data.user = pickPublicDataFromUser(options.user)
         data.userId = options.user.userEmail
      }

      const docSegments = [livestream.id, "popularityEvents"]

      if (options?.customId) {
         // we have a document id to use
         docSegments.push(this.docId(type, options.customId))
         const docRef = doc(this.firestore, "livestreams", ...docSegments)
         setDoc(docRef, data, { merge: true }).catch(console.error)
      } else {
         // let firestore generate a document id
         setDoc(doc(this.firestore, "livestreams", ...docSegments), data).catch(
            console.error
         )
      }
   }

   private getPoints(type: PopularityEventType) {
      return PopularityEventTypes[type]
   }

   private docId(type: PopularityEventType, customId: string) {
      return `${type}_${customId}`
   }
}

type AddPopularityEventOptions = {
   customId?: string
   user?: UserData
}

export const recommendationServiceInstance = new RecommendationService(
   FirestoreInstance as any
)

export default RecommendationService
