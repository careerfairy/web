import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   OfflineEvent,
   OfflineEventWithDistance,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { collection, GeoPoint, getDocs, query, where } from "firebase/firestore"
import { distanceBetween, geohashQueryBounds } from "geofire-common"
import type { NextApiRequest, NextApiResponse } from "next"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import {
   SerializedDocument,
   serializeDocument,
} from "../../../util/firebaseSerializer"

/**
 * API route to get offline events within 150km of user's location
 * Uses Vercel's geolocation headers to determine user's coordinates
 * Falls back to Zurich, Switzerland for local development
 */
export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse<
      SerializedDocument<OfflineEventWithDistance>[] | { error: string }
   >
) {
   try {
      const RADIUS_KM = 150
      const RADIUS_METERS = RADIUS_KM * 1000

      // Get coordinates from Vercel headers
      const latStr = req.headers["x-vercel-ip-latitude"] as string | undefined
      const lonStr = req.headers["x-vercel-ip-longitude"] as string | undefined

      let latitude: number
      let longitude: number

      // Check if we have Vercel headers (production/preview)
      if (latStr && lonStr) {
         latitude = parseFloat(latStr)
         longitude = parseFloat(lonStr)
         console.log(`📍 Using Vercel geolocation: [${latitude}, ${longitude}]`)
      } else {
         // Local development fallback - Zurich, Switzerland
         latitude = 47.3769
         longitude = 8.5417
         console.log(
            `📍 Local development detected, using Zurich coordinates: [${latitude}, ${longitude}]`
         )
      }

      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude)) {
         console.error("Invalid coordinates received")
         return res.status(200).json([])
      }

      console.log(
         `🔍 Searching for offline events within ${RADIUS_KM}km of [${latitude}, ${longitude}]`
      )

      // Calculate geohash query bounds for the search radius
      const bounds = geohashQueryBounds([latitude, longitude], RADIUS_METERS)

      console.log(
         `📊 Generated ${bounds.length} geohash query bounds for proximity search`
      )

      // Query Firestore for future events only
      // Note: We filter by startAt in the query (to eliminate past events)
      // and do geohash filtering in-memory (fewer records to check)
      const now = new Date()
      const snapshot = await getDocs(
         query(
            collection(FirestoreInstance, "offlineEvents"),
            where("hidden", "==", false),
            where("published", "==", true),
            where("startAt", ">", now)
         ).withConverter(createGenericConverter<OfflineEvent>())
      )

      console.log(
         `📊 Found ${snapshot.size} future events, filtering by geohash bounds`
      )

      // Collect events that fall within any of the geohash bounds
      const eventMap = new Map<string, OfflineEvent>()
      for (const doc of snapshot.docs) {
         const event = doc.data()
         if (!event || !event.address?.geoHash) continue

         // Check if event's geohash falls within any of our query bounds
         const eventGeoHash = event.address.geoHash
         const isWithinBounds = bounds.some(
            (bound) => eventGeoHash >= bound[0] && eventGeoHash <= bound[1]
         )

         if (isWithinBounds) {
            eventMap.set(event.id, event)
         }
      }

      console.log(`✅ Found ${eventMap.size} events within geohash bounds`)

      // Calculate exact distances and filter by radius
      const eventsWithDistance: OfflineEventWithDistance[] = []

      for (const event of eventMap.values()) {
         // Skip events without valid geoPoint
         if (
            !event.address?.geoPoint ||
            !(event.address.geoPoint instanceof GeoPoint)
         ) {
            console.warn(
               `⚠️  Event ${event.id} has no valid geoPoint, skipping`
            )
            continue
         }

         const eventGeoPoint = event.address.geoPoint
         const distanceKm = distanceBetween(
            [latitude, longitude],
            [eventGeoPoint.latitude, eventGeoPoint.longitude]
         )

         // Only include events within the radius
         if (distanceKm <= RADIUS_KM) {
            eventsWithDistance.push({
               ...event,
               distanceInKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal place
            })
         }
      }

      // Sort by distance (nearest first)
      eventsWithDistance.sort((a, b) => a.distanceInKm - b.distanceInKm)

      console.log(
         `🎯 Returning ${eventsWithDistance.length} offline events within ${RADIUS_KM}km`
      )

      // Serialize Firestore Timestamps and GeoPoints before sending
      const serializedEvents = eventsWithDistance.map(serializeDocument)

      return res.status(200).json(serializedEvents)
   } catch (error) {
      console.error("❌ Error fetching offline events by location:", error)
      return res.status(500).json({ error: "Internal server error" })
   }
}
