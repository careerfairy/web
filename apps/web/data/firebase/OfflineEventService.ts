import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UTMParams } from "@careerfairy/shared-lib/commonTypes"
import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { TrackOfflineEventActionRequest } from "@careerfairy/shared-lib/functions/types"
import { AuthorInfo } from "@careerfairy/shared-lib/livestreams"
import {
   OfflineEvent,
   OfflineEventStats,
   OfflineEventStatsAction,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { UserData } from "@careerfairy/shared-lib/users"
import {
   collection,
   deleteDoc,
   doc,
   getDoc,
   getDocs,
   increment,
   limit,
   orderBy,
   query,
   setDoc,
   Timestamp,
   updateDoc,
   where,
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import {
   deserializeDocument,
   SerializedDocument,
} from "util/firebaseSerializer"
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
   async getById(offlineEventId: string): Promise<OfflineEvent | null> {
      const ref = doc(
         this.firestore,
         "offlineEvents",
         offlineEventId
      ).withConverter(createGenericConverter<OfflineEvent>())

      const docSnap = await getDoc(ref)

      return docSnap.exists() ? docSnap.data() : null
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
    * Get offline events within 150km of user's location
    * Prioritizes user's profile location over IP-based geolocation
    * @param userData - Optional user data containing profile location (stateIsoCode, countryIsoCode)
    * @returns Array of offline events within the radius
    */
   async getOfflineEvents(
      userData?: Pick<UserData, "stateIsoCode" | "countryIsoCode">
   ): Promise<OfflineEvent[]> {
      try {
         // Build query params with user's profile location if available
         const params = new URLSearchParams()
         if (userData?.stateIsoCode && userData?.countryIsoCode) {
            params.append("stateCode", userData.stateIsoCode)
            params.append("countryCode", userData.countryIsoCode)
         }

         const url = `/api/offline-events/nearby${
            params.toString() ? `?${params.toString()}` : ""
         }`
         const response = await fetch(url)

         if (!response.ok) {
            console.error(`API request failed with status: ${response.status}`)
            return []
         }

         const serializedEvents: SerializedDocument<OfflineEvent>[] =
            await response.json()

         return serializedEvents.map(deserializeDocument)
      } catch (error) {
         console.error("Error fetching offline events by location:", error)
         return []
      }
   }

   /**
    * Get offline event stats by event ID
    * @param offlineEventId - The ID of the offline event
    * @returns Promise with the offline event stats or null if not found
    */
   async getOfflineEventStats(
      offlineEventId: string
   ): Promise<OfflineEventStats | null> {
      const statsRef = doc(
         this.firestore,
         "offlineEventStats",
         offlineEventId
      ).withConverter(createGenericConverter<OfflineEventStats>())

      const statsSnap = await getDoc(statsRef)
      return statsSnap.exists() ? statsSnap.data() : null
   }

   /**
    * Fetches the closest future offline event stats from a given date for a specific group.
    * @param groupId - The ID of the group to fetch the offline event stats for
    * @param fromDate - The date to start searching from (defaults to current date)
    * @returns Promise which resolves to the closest future offline event stats or null if there are no upcoming events
    */
   async getClosestFutureOfflineEventStatsFromDate(
      groupId: string,
      fromDate: Date = new Date()
   ): Promise<OfflineEventStats | null> {
      const q = query(
         collection(this.firestore, "offlineEventStats"),
         where("offlineEvent.group.id", "==", groupId),
         where("offlineEvent.startAt", ">", fromDate),
         where("offlineEvent.published", "==", true),
         orderBy("offlineEvent.startAt", "asc"),
         where("deleted", "==", false),
         limit(1)
      ).withConverter(createGenericConverter<OfflineEventStats>())

      const snapshot = await getDocs(q)
      return snapshot.docs[0]?.data() || null
   }

   /**
    * Fetches the closest past offline event stats from a given date for a specific group.
    * @param groupId - The ID of the group to fetch the offline event stats for
    * @param fromDate - The date to start searching from (defaults to current date)
    * @returns Promise which resolves to the closest past offline event stats or null if there are no past events
    */
   async getClosestPastOfflineEventStatsFromDate(
      groupId: string,
      fromDate: Date = new Date()
   ): Promise<OfflineEventStats | null> {
      const q = query(
         collection(this.firestore, "offlineEventStats"),
         where("offlineEvent.group.id", "==", groupId),
         where("offlineEvent.startAt", "<", fromDate),
         where("offlineEvent.published", "==", true),
         orderBy("offlineEvent.startAt", "desc"),
         where("deleted", "==", false),
         limit(1)
      ).withConverter(createGenericConverter<OfflineEventStats>())

      const snapshot = await getDocs(q)
      return snapshot.docs[0]?.data() || null
   }

   /**
    * Fetches all future and published offline event stats for a specific group.
    * @param groupId - The ID of the group to fetch the offline event stats for
    * @returns Promise which resolves to an array of future offline event stats
    */
   async getFutureAndPublishedOfflineEventStats(
      groupId: string
   ): Promise<OfflineEventStats[]> {
      const baseQuery = query(
         collection(this.firestore, "offlineEventStats"),
         where("offlineEvent.group.id", "==", groupId),
         where("offlineEvent.startAt", ">", new Date()),
         where("offlineEvent.published", "==", true),
         where("deleted", "==", false),
         orderBy("offlineEvent.startAt", "asc")
      ).withConverter(createGenericConverter<OfflineEventStats>())

      const snapshot = await getDocs(baseQuery)
      return snapshot.docs.map((doc) => doc.data())
   }

   /**
    * Helper method that consolidates tracking logic
    * Calls the consolidated cloud function with the appropriate action type
    * Supports both authenticated users (via userData) and anonymous users (via fingerprint)
    *
    * @param offlineEventId - The ID of the offline event
    * @param actionType - The type of action (View or Click)
    * @param userDataOrFingerprint - Either UserData object or fingerprint string
    * @param utm - UTM parameters
    */
   async trackOfflineEventAction(
      offlineEventId: string,
      actionType: OfflineEventStatsAction,
      userDataOrFingerprint: UserData | string,
      utm: UTMParams | null
   ): Promise<void> {
      const isUserData = typeof userDataOrFingerprint === "object"

      await httpsCallable<TrackOfflineEventActionRequest>(
         FunctionsInstance,
         FUNCTION_NAMES.trackOfflineEventAction
      )({
         offlineEventId,
         actionType,
         utm,
         ...(isUserData
            ? { userData: userDataOrFingerprint }
            : { fingerprint: userDataOrFingerprint }),
      })
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const offlineEventService = new OfflineEventService(
   FirestoreInstance as any
)

export default OfflineEventService
