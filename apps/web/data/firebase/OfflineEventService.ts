import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { AuthorInfo } from "@careerfairy/shared-lib/livestreams"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { NearbySearchParams } from "@careerfairy/shared-lib/offline-events/OfflineEventRepository"
import { AddressAutofillFeatureSuggestion } from "@mapbox/search-js-core"
import {
   GeoPoint,
   Timestamp,
   collection,
   deleteDoc,
   doc,
   limit as firestoreLimit,
   getDoc,
   getDocs,
   increment,
   orderBy,
   query,
   setDoc,
   updateDoc,
   where,
} from "firebase/firestore"
import {
   distanceBetween,
   geohashForLocation,
   geohashQueryBounds,
} from "geofire-common"
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

      // Derive location and geohash from Mapbox street suggestion if available
      const geoData = offlineEvent.street
         ? extractLocationFromSuggestion(offlineEvent.street)
         : undefined

      const eventData: Partial<OfflineEvent> = {
         ...offlineEvent,
         id: newDocRef.id,
         author,
         createdAt: now,
         updatedAt: now,
         lastUpdatedBy: author,
         // Include derived geo data if available, but allow explicit overrides from caller
         ...(geoData && {
            location: geoData.location,
            geoHash: geoData.geoHash,
         }),
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

      // Derive location and geohash from Mapbox street suggestion if available
      const geoData = offlineEvent.street
         ? extractLocationFromSuggestion(offlineEvent.street)
         : undefined

      const updateData = {
         ...offlineEvent,
         lastUpdatedBy: author,
         updatedAt: Timestamp.now(),
         // Include derived geo data if available, but allow explicit overrides from caller
         ...(geoData && {
            location: geoData.location,
            geoHash: geoData.geoHash,
         }),
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

   /**
    * Get nearby offline events using geohash-based queries
    * @param params - Search parameters including center point and radius
    * @returns Array of nearby offline events
    */
   async getNearbyEvents(params: NearbySearchParams): Promise<OfflineEvent[]> {
      const { center, radiusInKm, limit = 50 } = params

      // Get geohash bounds for the search area
      const bounds = geohashQueryBounds(
         [center.latitude, center.longitude],
         radiusInKm
      )

      // Create queries for each geohash bound
      const queries = bounds.map((bound) => {
         const collectionRef = collection(
            FirestoreInstance,
            "offlineEvents"
         ).withConverter(createGenericConverter<OfflineEvent>())

         return query(
            collectionRef,
            where("geoHash", ">=", bound[0]),
            where("geoHash", "<=", bound[1]),
            where("status", "==", "upcoming"),
            where("hidden", "==", false),
            orderBy("geoHash"),
            firestoreLimit(limit)
         )
      })

      // Execute all queries in parallel
      const snapshots = await Promise.all(queries.map((q) => getDocs(q)))

      // Combine results and remove duplicates
      const allEvents: OfflineEvent[] = []
      const seenIds = new Set<string>()

      snapshots.forEach((snapshot) => {
         snapshot.docs.forEach((doc) => {
            const event = doc.data()
            if (!seenIds.has(event.id)) {
               seenIds.add(event.id)
               allEvents.push(event)
            }
         })
      })

      // Filter by actual distance to remove false positives
      const nearbyEvents = allEvents.filter((event) => {
         const distance = distanceBetween(
            [center.latitude, center.longitude],
            [event.location.latitude, event.location.longitude]
         )
         return distance <= radiusInKm
      })

      // Sort by distance (closest first)
      nearbyEvents.sort((a, b) => {
         const distanceA = distanceBetween(
            [center.latitude, center.longitude],
            [a.location.latitude, a.location.longitude]
         )
         const distanceB = distanceBetween(
            [center.latitude, center.longitude],
            [b.location.latitude, b.location.longitude]
         )
         return distanceA - distanceB
      })

      return nearbyEvents.slice(0, limit)
   }
}

/**
 * Extracts location and geohash from Mapbox street suggestion
 * @param suggestion - The Mapbox AddressAutofillFeatureSuggestion
 * @returns Object with location (GeoPoint) and geoHash, or undefined if invalid
 */
function extractLocationFromSuggestion(
   suggestion: AddressAutofillFeatureSuggestion
) {
   const coordinates = suggestion.geometry.coordinates
   if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const [lng, lat] = coordinates
      return {
         location: new GeoPoint(lat, lng),
         geoHash: geohashForLocation([lat, lng]),
      }
   }
   return undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const offlineEventService = new OfflineEventService(
   FirestoreInstance as any
)

export default OfflineEventService
