import {
   LivestreamEvent,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/livestreams"
import {
   PopularityEventData,
   PopularityEventType,
} from "@careerfairy/shared-lib/livestreams/popularity"
import { pickPublicDataFromUser, UserData } from "@careerfairy/shared-lib/users"
import {
   addDoc,
   collection,
   deleteDoc,
   doc,
   Firestore,
   serverTimestamp,
   setDoc,
} from "firebase/firestore"
import { getReferralInformation } from "util/CommonUtil"
import { FirestoreInstance } from "./FirebaseInstance"

export class RecommendationService {
   constructor(private readonly firestore: Firestore) {}

   createdQuestion(livestream: LivestreamEvent, userData: UserData) {
      if (!userData) return

      this.addPopularityEvent("CREATED_QUESTION", livestream, {
         user: userData,
         customId: userData.authId,
      })
   }

   joinTalentPool(livestream: LivestreamEvent, userData: UserData) {
      if (!userData) return

      this.addPopularityEvent("JOINED_TALENT_POOL", livestream, {
         user: userData,
         customId: userData.authId,
      })
   }

   leaveTalentPool(livestreamId: string, authId: string) {
      this.removePopularityEvent("JOINED_TALENT_POOL", livestreamId, authId)
   }

   visitDetailPage(livestream: LivestreamEvent, visitorId: string) {
      let type: PopularityEventType = "VISITED_DETAIL_PAGE"
      if (getReferralInformation()?.referralCode) {
         type = "VISITED_DETAIL_PAGE_FROM_SHARED_LINK"
      }

      this.addPopularityEvent(type, livestream, {
         customId: visitorId,
      })
   }

   upvoteQuestion(livestream: LivestreamEvent, userData: UserData) {
      if (!userData) return

      this.addPopularityEvent("UPVOTED_QUESTION", livestream, {
         user: userData,
         customId: userData.authId,
      })
   }

   registerEvent(livestream: LivestreamEvent, userData: UserData) {
      if (!userData) return

      let type: PopularityEventType = "SUCCESSFULLY_REGISTERED_TO_EVENT"
      if (getReferralInformation()?.referralCode) {
         type = "SUCCESSFULLY_REGISTERED_TO_EVENT_FROM_SHARED_LINK"
      }

      this.addPopularityEvent(type, livestream, {
         user: userData,
         customId: userData.authId,
      })
   }

   unRegisterEvent(livestreamId: string, authId: string) {
      this.removePopularityEvent(
         "SUCCESSFULLY_REGISTERED_TO_EVENT",
         livestreamId,
         authId
      )
      this.removePopularityEvent(
         "SUCCESSFULLY_REGISTERED_TO_EVENT_FROM_SHARED_LINK",
         livestreamId,
         authId
      )
   }

   /**
    * Adds a popularity event to the database
    *
    * A promise will be created but not awaited
    *
    * @param livestream - Livestream object
    * @param type - Popularity event type
    */
   private addPopularityEvent(
      type: PopularityEventType,
      livestream: LivestreamEvent,
      options?: AddPopularityEventOptions
   ): void {
      return // Disable adding popularity events for now

      const data: Omit<PopularityEventData, "id"> = {
         type,
         createdAt: serverTimestamp() as any,

         livestreamId: livestream.id,
         livestream: pickPublicDataFromLivestream(livestream),
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
         setDoc(docRef, data).catch((e) => {
            // rules don't allow document updates to save costs
            // ignore error
            if (
               e?.message?.includes("PERMISSION_DENIED") ||
               e?.message?.includes("Missing or insufficient permissions")
            ) {
               return
            }

            console.error(e)
         })
      } else {
         // let firestore generate a document id
         addDoc(
            collection(this.firestore, "livestreams", ...docSegments),
            data
         ).catch(console.error)
      }
   }

   /**
    * Remove a popularity event document
    * Will trigger a function that decreases the livestream popularity field
    */
   private removePopularityEvent(
      type: PopularityEventType,
      livestreamId: string,
      docId: string
   ) {
      deleteDoc(
         doc(
            this.firestore,
            "livestreams",
            livestreamId,
            "popularityEvents",
            this.docId(type, docId)
         )
      ).catch(console.error)
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
