import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UTMParams } from "@careerfairy/shared-lib/commonTypes"
import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { TrackOfflineEventActionRequest } from "@careerfairy/shared-lib/functions/types"
import { AuthorInfo } from "@careerfairy/shared-lib/livestreams"
import {
   OfflineEvent,
   OfflineEventStatsAction,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { UserData } from "@careerfairy/shared-lib/users"
import {
   Timestamp,
   collection,
   deleteDoc,
   doc,
   getDoc,
   getDocs,
   increment,
   query,
   setDoc,
   updateDoc,
   where,
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { FirestoreInstance, FunctionsInstance } from "./FirebaseInstance"

export class OfflineEventService {
   constructor(private readonly firestore: typeof FirestoreInstance) {}

   /**
    * Creates a new offline event
    * @param offlineEvent - The offline event data to create
    * @param author - The author information
    * @returns Promise with the created event ID
    */
   async createOfflineEvent(
      offlineEvent: Partial<OfflineEvent>,
      author: AuthorInfo
   ) {
      const newDocRef = doc(
         collection(this.firestore, "offlineEvents")
      ).withConverter(createGenericConverter<OfflineEvent>())

      const now = Timestamp.now()

      const eventData: Partial<OfflineEvent> = {
         ...offlineEvent,
         id: newDocRef.id,
         author,
         createdAt: now,
         updatedAt: now,
         lastUpdatedBy: author,
      }

      await setDoc(newDocRef, eventData)
      return newDocRef.id
   }

   /**
    * Updates an existing offline event
    * @param offlineEvent - The offline event data to update
    * @param author - The author information
    */
   async updateOfflineEvent(
      offlineEvent: Partial<OfflineEvent>,
      author: AuthorInfo
   ) {
      if (!offlineEvent.id) {
         throw new Error("Offline event ID is required for update")
      }

      const ref = doc(
         this.firestore,
         "offlineEvents",
         offlineEvent.id
      ).withConverter(createGenericConverter<OfflineEvent>())

      const updateData = {
         ...offlineEvent,
         lastUpdatedBy: author,
         updatedAt: Timestamp.now(),
      }

      await updateDoc(ref, updateData)
   }

   /**
    * Deletes an offline event
    * @param offlineEventId - The ID of the offline event to delete
    */
   async deleteOfflineEvent(offlineEventId: string) {
      const ref = doc(this.firestore, "offlineEvents", offlineEventId)
      await deleteDoc(ref)
   }

   /**
    * Gets an offline event by ID
    * @param offlineEventId - The ID of the offline event to fetch
    * @returns Promise with the offline event data
    */
   async getById(offlineEventId: string): Promise<OfflineEvent> {
      const ref = doc(
         this.firestore,
         "offlineEvents",
         offlineEventId
      ).withConverter(createGenericConverter<OfflineEvent>())

      const docSnap = await getDoc(ref)

      return docSnap.data()
   }

   /**
    * Decreases the available offline events count for a group
    * @param groupId - The ID of the group
    */
   async decreaseGroupAvailableOfflineEvents(groupId: string) {
      const ref = doc(this.firestore, "careerCenterData", groupId)

      await updateDoc(ref, {
         availableOfflineEvents: increment(-1),
      })
   }

   /**
    * Get offline events
    * @returns Array of offline events
    */
   async getOfflineEvents(): Promise<OfflineEvent[]> {
      const snapshots = await getDocs(
         query(
            collection(FirestoreInstance, "offlineEvents"),
            where("hidden", "==", false),
            where("published", "==", true)
         ).withConverter(createGenericConverter<OfflineEvent>())
      )

      return snapshots.docs.map((doc) => doc.data())
   }

   /**
    * Helper method that consolidates tracking logic
    * Calls the consolidated cloud function with the appropriate action type
    */
   async trackOfflineEventAction(
      offlineEventId: string,
      actionType: OfflineEventStatsAction,
      userData: UserData,
      utm: UTMParams | null
   ): Promise<void> {
      await httpsCallable<TrackOfflineEventActionRequest>(
         FunctionsInstance,
         FUNCTION_NAMES.trackOfflineEventAction
      )({ offlineEventId, actionType, utm, userData })
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const offlineEventService = new OfflineEventService(
   FirestoreInstance as any
)

export default OfflineEventService
