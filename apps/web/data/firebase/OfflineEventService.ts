import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { AuthorInfo } from "@careerfairy/shared-lib/livestreams"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import {
   Timestamp,
   collection,
   deleteDoc,
   doc,
   getDoc,
   getDocs,
   increment,
   setDoc,
   updateDoc,
} from "firebase/firestore"
import { FirestoreInstance } from "./FirebaseInstance"

export class OfflineEventService {
   constructor(private readonly firestore: typeof FirestoreInstance) {}

   async getById(eventId: string) {
      if (!eventId) return null

      const docRef = doc(
         FirestoreInstance,
         "offlineEvents",
         eventId
      ).withConverter(createGenericConverter<OfflineEvent>())
      const docSnap = await getDoc(docRef)
      return docSnap.data()
   }

   async getMany() {
      const collectionRef = collection(
         FirestoreInstance,
         "offlineEvents"
      ).withConverter(createGenericConverter<OfflineEvent>())
      const docsSnap = await getDocs(collectionRef)
      return docsSnap.docs.map((doc) => doc.data())
   }

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
         collection(FirestoreInstance, "offlineEvents")
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
