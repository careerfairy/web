import firebase from "firebase/compat/app"
import { distanceBetween, geohashQueryBounds } from "geofire-common"
import BaseFirebaseRepository from "../BaseFirebaseRepository"
import { Create } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"
import { AuthorInfo } from "../livestreams"
import { OfflineEvent } from "./offline-events"

export interface NearbySearchParams {
   center: firebase.firestore.GeoPoint
   radiusInKm: number
   limit?: number
}

export interface IOfflineEventRepository {
   createOfflineEvent(
      event: Create<OfflineEvent>,
      author: AuthorInfo
   ): Promise<void>

   updateOfflineEvent(
      event: Partial<OfflineEvent>,
      author: AuthorInfo
   ): Promise<void>

   deleteOfflineEvent(eventId: string): Promise<void>

   getNearbyEvents(params: NearbySearchParams): Promise<OfflineEvent[]>
}

export class FirebaseOfflineEventRepository
   extends BaseFirebaseRepository
   implements IOfflineEventRepository
{
   protected readonly COLLECTION_NAME = "offlineEvents"

   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   async createOfflineEvent(event: Create<OfflineEvent>, author: AuthorInfo) {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc()
      const now = this.fieldValue.serverTimestamp() as Timestamp

      const newOfflineEvent: OfflineEvent = {
         ...event,
         author,
         lastUpdatedBy: author,
         id: ref.id,
         createdAt: now,
         updatedAt: now,
      }

      await ref.set(newOfflineEvent)
   }

   async updateOfflineEvent(event: Partial<OfflineEvent>, author: AuthorInfo) {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc(event.id)
      const now = this.fieldValue.serverTimestamp() as Timestamp

      const updatedOfflineEvent: Partial<OfflineEvent> = {
         ...event,
         lastUpdatedBy: author,
         updatedAt: now,
      }

      await ref.update(updatedOfflineEvent)
   }

   async deleteOfflineEvent(eventId: string) {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc(eventId)
      await ref.delete()
   }

   async getNearbyEvents(params: NearbySearchParams): Promise<OfflineEvent[]> {
      const { center, radiusInKm, limit = 50 } = params
      console.log("🛰️ [getNearbyEvents] Center coordinates:", center)

      // Get geohash bounds for the search area
      const bounds = geohashQueryBounds(
         [center.latitude, center.longitude],
         radiusInKm
      )
      console.log("🗺️ [getNearbyEvents] Geohash bounds calculated:", bounds)

      // Create queries for each geohash bound
      const queries = bounds.map((bound, idx) => {
         console.log(
            `🔎 [getNearbyEvents] Creating query for bound #${idx + 1}:`,
            bound
         )
         return this.firestore
            .collection(this.COLLECTION_NAME)
            .where("geoHash", ">=", bound[0])
            .where("geoHash", "<=", bound[1])
            .where("status", "==", "upcoming") // Only get upcoming events
            .where("hidden", "==", false) // Exclude hidden events
            .limit(limit)
      })

      // Execute all queries in parallel
      console.log(
         "⏳ [getNearbyEvents] Executing",
         queries.length,
         "queries in parallel"
      )
      const snapshots = await Promise.all(
         queries.map((query, idx) => {
            console.log(
               `📤 [getNearbyEvents] Fetching snapshot for query #${idx + 1}`
            )
            return query.get()
         })
      )

      // Combine results and remove duplicates
      const allEvents: OfflineEvent[] = []
      const seenIds = new Set<string>()
      let totalDocs = 0

      snapshots.forEach((snapshot, snapIdx) => {
         console.log(
            `📦 [getNearbyEvents] Processing snapshot #${snapIdx + 1} with ${
               snapshot.docs.length
            } docs`
         )
         totalDocs += snapshot.docs.length
         snapshot.docs.forEach((doc) => {
            const event = doc.data() as OfflineEvent
            if (!seenIds.has(event.id)) {
               seenIds.add(event.id)
               allEvents.push(event)
            }
         })
      })

      console.log(
         `🧮 [getNearbyEvents] Total docs fetched: ${totalDocs}, unique events: ${allEvents.length}`
      )

      // Filter by actual distance to remove false positives
      const nearbyEvents = allEvents.filter((event) => {
         const distance = distanceBetween(
            [center.latitude, center.longitude],
            [event.location.latitude, event.location.longitude]
         )
         return distance <= radiusInKm
      })

      console.log(
         `📏 [getNearbyEvents] Events within ${radiusInKm}km: ${nearbyEvents.length}`
      )

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

      const result = nearbyEvents.slice(0, limit)
      console.log(
         `✅ [getNearbyEvents] Returning ${result.length} events (limit: ${limit})`
      )

      return result
   }
}
