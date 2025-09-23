import { GetNearbyOfflineEventsRequest } from "@careerfairy/shared-lib/functions/types"
import { NearbySearchParams } from "@careerfairy/shared-lib/offline-events/OfflineEventRepository"
import { GeoPoint } from "firebase-admin/firestore"
import { CallableRequest, onCall } from "firebase-functions/v2/https"
import { offlineEventRepo } from "./api/repositories"

/**
 * Cloud function to get nearby offline events based on user location
 * Uses geohash-based queries for efficient geospatial searching
 */
export const getNearbyOfflineEvents = onCall(
   async (request: CallableRequest<GetNearbyOfflineEventsRequest>) => {
      const { radiusInKm, limit = 20 } = request.data

      // Validate required parameters
      if (!radiusInKm) {
         throw new Error("Missing required parameter: radiusInKm")
      }

      if (radiusInKm <= 0 || radiusInKm > 10000) {
         throw new Error("Invalid radius: must be between 0 and 1000 km")
      }

      if (limit > 100) {
         throw new Error("Limit cannot exceed 100 events")
      }

      // Get location from App Engine headers
      const headers = request.rawRequest?.headers
      const cityLatLng = headers?.["x-appengine-citylatlong"] as string

      // Parse coordinates from cityLatLng format: "lat,lng" (e.g., "52.3676,4.9041")
      const [lat, lng] = cityLatLng?.split(",").map(Number) || [47.38, 8.57] // Zurich default

      try {
         // Create search parameters
         const searchParams: NearbySearchParams = {
            center: new GeoPoint(lat, lng),
            radiusInKm,
            limit,
         }

         // Query for nearby events
         return offlineEventRepo.getNearbyEvents(searchParams)
      } catch (error) {
         console.error("Error fetching nearby offline events:", error)
         throw new Error("Failed to fetch nearby offline events")
      }
   }
)
