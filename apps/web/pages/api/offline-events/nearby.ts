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
 * Geocodes a city name to coordinates using OpenStreetMap's Nominatim API
 * @param city - City name (e.g., "Zurich", "Munich")
 * @param countryCode - ISO country code (e.g., "CH", "DE")
 * @returns Coordinates or null if geocoding fails
 */
async function geocodeCity(
   city: string,
   countryCode: string
): Promise<{ latitude: number; longitude: number } | null> {
   try {
      const response = await fetch(
         `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
               q: city,
               countrycodes: countryCode.toLowerCase(),
               format: "json",
               limit: "1",
            }),
         {
            headers: {
               "User-Agent": "CareerFairy/1.0", // Nominatim requires User-Agent
            },
         }
      )

      if (!response.ok) {
         console.error(
            `Nominatim API error: ${response.status} ${response.statusText}`
         )
         return null
      }

      const data = await response.json()

      if (data && data.length > 0) {
         const result = data[0]
         return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
         }
      }

      return null
   } catch (error) {
      console.error(`Error geocoding city ${city}, ${countryCode}:`, error)
      return null
   }
}

/**
 * API route to get offline events within 150km of user's location
 * Prioritizes user's profile location over IP-based geolocation
 * Uses Vercel's geolocation headers as fallback
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

      let latitude: number
      let longitude: number
      let locationSource: string

      // Priority 1: Check for user profile location in query params
      const userCity = req.query.city as string | undefined
      const userCountry = req.query.country as string | undefined

      if (userCity && userCountry) {
         // Geocode the user's profile location
         const coords = await geocodeCity(userCity, userCountry)
         if (coords) {
            latitude = coords.latitude
            longitude = coords.longitude
            locationSource = "profile"
            console.log(
               `📍 Using profile location (${userCity}, ${userCountry}): [${latitude}, ${longitude}]`
            )
         } else {
            console.warn(
               `⚠️  Failed to geocode profile location: ${userCity}, ${userCountry}`
            )
            // Fall through to IP-based location
         }
      }

      // Priority 2: Get coordinates from Vercel headers (IP-based)
      if (!latitude || !longitude) {
         const latStr = req.headers["x-vercel-ip-latitude"] as
            | string
            | undefined
         const lonStr = req.headers["x-vercel-ip-longitude"] as
            | string
            | undefined

         if (latStr && lonStr) {
            latitude = parseFloat(latStr)
            longitude = parseFloat(lonStr)
            locationSource = "ip"
            console.log(
               `📍 Using IP geolocation: [${latitude}, ${longitude}]`
            )
         }
      }

      // Priority 3: Local development fallback - Zurich, Switzerland
      if (!latitude || !longitude) {
         latitude = 47.3769
         longitude = 8.5417
         locationSource = "fallback"
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
