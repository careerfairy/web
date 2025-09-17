import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { AuthorInfo } from "@careerfairy/shared-lib/livestreams"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import {
   Timestamp,
   addDoc,
   collection,
   deleteDoc,
   doc,
   increment,
   updateDoc,
} from "firebase/firestore"
import { FirestoreInstance } from "./FirebaseInstance"

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
      const collectionRef = collection(
         FirestoreInstance,
         "offlineEvents"
      ).withConverter(createGenericConverter<OfflineEvent>())

      const eventData: Omit<OfflineEvent, "id"> = {
         ...offlineEvent,
         author,
         createdAt: Timestamp.now(),
         updatedAt: Timestamp.now(),
         lastUpdatedBy: author,
      } as Omit<OfflineEvent, "id">

      const docRef = await addDoc(collectionRef, eventData)
      return docRef.id
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
         FirestoreInstance,
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
      const ref = doc(FirestoreInstance, "offlineEvents", offlineEventId)
      await deleteDoc(ref)
   }

   /**
    * Decreases the available offline events count for a group
    * @param groupId - The ID of the group
    */
   async decreaseGroupAvailableOfflineEvents(groupId: string) {
      const ref = doc(FirestoreInstance, "careerCenterData", groupId)

      await updateDoc(ref, {
         availableOfflineEvents: increment(-1),
      })
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const offlineEventService = new OfflineEventService(
   FirestoreInstance as any
)

export default OfflineEventService
