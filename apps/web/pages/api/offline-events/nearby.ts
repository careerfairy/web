import { BUNDLE_NAMES } from "@careerfairy/shared-lib/functions"
import {
   OfflineEvent,
   OfflineEventWithDistance,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { State } from "country-state-city"
import { GeoPoint } from "firebase/firestore"
import { distanceBetween, geohashQueryBounds } from "geofire-common"
import type { NextApiRequest, NextApiResponse } from "next"
import { shouldUseEmulators } from "util/CommonUtil"
import bundleService from "../../../data/bundle/BundleService"
import {
   SerializedDocument,
   serializeDocument,
} from "../../../util/firebaseSerializer"

/**
 * Gets coordinates for a state/city using the country-state-city package
 * No external API calls - data is bundled locally
 * @param stateIsoCode - State ISO code (e.g., "ZH" for Zurich)
 * @param countryCode - Country ISO code (e.g., "CH")
 * @returns Coordinates or null if not found
 */
function getStateCoordinates(
   stateIsoCode: string,
   countryCode: string
): { latitude: number; longitude: number } | null {
   try {
      const state = State.getStateByCodeAndCountry(stateIsoCode, countryCode)

      if (state?.latitude && state?.longitude) {
         const latitude = parseFloat(state.latitude)
         const longitude = parseFloat(state.longitude)

         if (!isNaN(latitude) && !isNaN(longitude)) {
            return { latitude, longitude }
         }
      }

      return null
   } catch (error) {
      console.error(
         `Error getting coordinates for state ${stateIsoCode}, ${countryCode}:`,
         error
      )
      return null
   }
}

type Location = {
   latitude: number
   longitude: number
   source: string
}

/**
 * API route to get offline events within 150km of user's location(s)
 * Queries both profile location (state ISO code) and IP-based location simultaneously
 * Merges results and uses minimum distance when events appear in both sets
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

      // Collect all available locations
      const locations: Location[] = []

      // Check for user profile location in query params
      const userStateCode = req.query.stateCode as string | undefined
      const userCountryCode = req.query.countryCode as string | undefined

      if (userStateCode && userCountryCode) {
         const coords = getStateCoordinates(userStateCode, userCountryCode)
         if (coords) {
            locations.push({
               latitude: coords.latitude,
               longitude: coords.longitude,
               source: "profile",
            })
            console.log(
               `📍 Profile location (${userStateCode}, ${userCountryCode}): [${coords.latitude}, ${coords.longitude}]`
            )
         } else {
            console.warn(
               `⚠️  Failed to get coordinates for profile location: ${userStateCode}, ${userCountryCode}`
            )
         }
      }

      // Get coordinates from Vercel headers (IP-based)
      const latStr = req.headers["x-vercel-ip-latitude"] as string | undefined
      const lonStr = req.headers["x-vercel-ip-longitude"] as string | undefined

      if (latStr && lonStr) {
         const ipLat = parseFloat(latStr)
         const ipLon = parseFloat(lonStr)
         if (!isNaN(ipLat) && !isNaN(ipLon)) {
            locations.push({
               latitude: ipLat,
               longitude: ipLon,
               source: "ip",
            })
            console.log(`📍 IP geolocation: [${ipLat}, ${ipLon}]`)
         }
      }

      // Local development fallback - Zurich, Switzerland
      if (locations.length === 0 && shouldUseEmulators()) {
         locations.push({
            latitude: 47.3769,
            longitude: 8.5417,
            source: "fallback",
         })
         console.log(
            `📍 Local development detected, using Zurich coordinates: [47.3769, 8.5417]`
         )
      }

      // Validate we have at least one location
      if (locations.length === 0) {
         console.error("No valid locations available")
         return res.status(200).json([])
      }

      console.log(
         `🔍 Searching for offline events within ${RADIUS_KM}km of ${locations.length} location(s)`
      )

      // Generate geohash query bounds for all locations and merge them
      const allBounds: Array<[string, string]> = []
      for (const location of locations) {
         const bounds = geohashQueryBounds(
            [location.latitude, location.longitude],
            RADIUS_METERS
         )
         allBounds.push(...bounds)
      }

      console.log(
         `📊 Generated ${allBounds.length} geohash query bounds across ${locations.length} location(s)`
      )

      // Get offline events from bundle cache
      const allEvents = await bundleService.loadAndQuery(
         BUNDLE_NAMES.allFutureOfflineEvents
      )

      console.log(
         `📊 Found ${allEvents.length} future events, filtering by geohash bounds`
      )

      // Collect events that fall within any of the geohash bounds
      const eventMap = new Map<string, OfflineEvent>()
      for (const event of allEvents) {
         if (!event || !event.address?.geoHash) continue

         // Check if event's geohash falls within any of our query bounds
         const eventGeoHash = event.address.geoHash
         const isWithinBounds = allBounds.some(
            (bound) => eventGeoHash >= bound[0] && eventGeoHash <= bound[1]
         )

         if (isWithinBounds) {
            eventMap.set(event.id, event)
         }
      }

      console.log(`✅ Found ${eventMap.size} events within geohash bounds`)

      // Calculate distances from all locations and track minimum per event
      const eventsWithDistanceMap = new Map<string, OfflineEventWithDistance>()

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
         const distances: number[] = []

         // Calculate distance from each available location
         for (const location of locations) {
            const distanceKm = distanceBetween(
               [location.latitude, location.longitude],
               [eventGeoPoint.latitude, eventGeoPoint.longitude]
            )

            // Only consider distances within radius
            if (distanceKm <= RADIUS_KM) {
               distances.push(distanceKm)
            }
         }

         // If event is within radius of at least one location, use minimum distance
         if (distances.length > 0) {
            const minDistance = Math.min(...distances)
            eventsWithDistanceMap.set(event.id, {
               ...event,
               distanceInKm: Math.round(minDistance * 10) / 10, // Round to 1 decimal place
            })
         }
      }

      // Convert map to array and sort by distance (nearest first)
      const eventsWithDistance = Array.from(eventsWithDistanceMap.values())
      eventsWithDistance.sort((a, b) => a.distanceInKm - b.distanceInKm)

      console.log(
         `🎯 Returning ${eventsWithDistance.length} offline events within ${RADIUS_KM}km (from ${locations.length} location(s))`
      )

      // Serialize Firestore Timestamps and GeoPoints before sending
      const serializedEvents = eventsWithDistance.map(serializeDocument)

      return res.status(200).json(serializedEvents)
   } catch (error) {
      console.error("❌ Error fetching offline events by location:", error)
      return res.status(500).json({ error: "Internal server error" })
   }
}
