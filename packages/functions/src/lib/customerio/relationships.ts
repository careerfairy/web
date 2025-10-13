import { UTMParams } from "@careerfairy/shared-lib/commonTypes"
import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import axios, { AxiosInstance } from "axios"
import { logger } from "firebase-functions"
import { isLocalEnvironment, isTestEnvironment } from "../../util"
import { OBJECT_TYPES } from "./objectsClient"

/**
 * Customer.io Livestream Relationships
 *
 * IMPORTANT: Customer.io maintains ONE relationship between a user and a livestream,
 * identified by userAuthId + livestreamId. There are no separate relationship types.
 *
 * All data is preserved through prefixed attributes:
 * - registered_at, registration_utm, registration_origin_source
 * - participated_at, participation_utm
 * - seen_first_at, seen_last_at, seen_view_count, seen_first_utm, seen_last_utm
 *
 * The presence of these attributes indicates the user's interaction history.
 */

/**
 * Additional context data for registration relationships
 * Note: registeredAt should be a Unix timestamp (seconds since epoch)
 */
export interface RegistrationRelationshipData {
   registeredAt?: number
   utm?: UTMParams
   originSource?: ImpressionLocation
}

/**
 * Additional context data for participation relationships
 * Note: participatedAt should be a Unix timestamp (seconds since epoch)
 */
export interface ParticipationRelationshipData {
   participatedAt?: number
   utm?: UTMParams
}

/**
 * Additional context data for seen relationships
 * Note: Timestamps should be Unix timestamps (seconds since epoch)
 */
export interface SeenRelationshipData {
   firstSeenAt?: number
   lastSeenAt?: number
   viewCount?: number
   firstUtm?: UTMParams
   lastUtm?: UTMParams
}

const CUSTOMERIO_TRACK_API_URL = "https://track-eu.customer.io"

/**
 * Client for managing Customer.io livestream relationships
 */
export class CustomerIORelationshipsClient {
   private axiosInstance: AxiosInstance

   constructor() {
      if (isTestEnvironment()) {
         logger.info("Using Customer.io relationships client mock")
         // Create a stub axios instance for test environment
         this.axiosInstance = axios.create()
      } else {
         let siteId = process.env.CUSTOMERIO_SITE_ID
         let apiKey = process.env.CUSTOMERIO_TRACKING_API_KEY

         if (isLocalEnvironment()) {
            siteId = process.env.DEV_CUSTOMERIO_SITE_ID
            apiKey = process.env.DEV_CUSTOMERIO_TRACKING_API_KEY
            logger.info(
               "Running in local environment. Ensure DEV_CUSTOMERIO_SITE_ID and DEV_CUSTOMERIO_TRACKING_API_KEY are set for testing."
            )
         }

         if (!siteId || !apiKey) {
            throw new Error("Customer.io credentials not configured")
         }

         const auth = Buffer.from(`${siteId}:${apiKey}`).toString("base64")

         this.axiosInstance = axios.create({
            baseURL: CUSTOMERIO_TRACK_API_URL,
            headers: {
               Authorization: `Basic ${auth}`,
               "Content-Type": "application/json",
            },
         })
      }
   }

   /**
    * Creates or updates a relationship between a user and a livestream object in Customer.io
    * This enables segmentation based on user interactions with specific livestreams
    *
    * @param userAuthId The user's authentication ID (used as Customer.io user identifier)
    * @param livestreamId The livestream identifier
    * @param attributes Attributes to attach to the relationship (registered_at, participated_at, utm data, etc.)
    */
   private async createUserLivestreamRelationship(
      userAuthId: string,
      livestreamId: string,
      attributes?: Record<string, any>
   ): Promise<void> {
      if (isTestEnvironment()) {
         logger.info(
            `[TEST] Would create Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId}`,
            attributes
         )
         return
      }

      logger.info(
         `🔥 Creating Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId}`,
         attributes
      )

      try {
         await this.axiosInstance.post("/api/v2/entity", {
            type: "person",
            action: "add_relationships",
            identifiers: {
               id: userAuthId,
            },
            cio_relationships: [
               {
                  identifiers: {
                     object_type_id: OBJECT_TYPES.LIVESTREAMS,
                     object_id: livestreamId,
                  },
                  relationship_attributes: attributes || {},
               },
            ],
         })
         logger.info(
            `Successfully created Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId}`
         )
      } catch (error) {
         logger.error(
            `Failed to create Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId}`,
            {
               error: error?.message,
               response: error?.response?.data,
               status: error?.response?.status,
               userAuthId,
               livestreamId,
               attributes,
            }
         )
         throw error
      }
   }

   /**
    * Helper function to update registration data on a livestream relationship
    * Uses prefixed attribute names to preserve any existing participation data
    * @param userAuthId The user's authentication ID
    * @param livestreamId The livestream identifier
    * @param data Optional registration data (timestamp, UTM, origin)
    */
   public async updateRegistrationData(
      userAuthId: string,
      livestreamId: string,
      data?: RegistrationRelationshipData
   ): Promise<void> {
      const attributes: Record<string, any> = {}

      if (data?.registeredAt) attributes.registered_at = data.registeredAt
      if (data?.utm) attributes.registration_utm = data.utm
      if (data?.originSource)
         attributes.registration_origin_source = data.originSource

      return this.createUserLivestreamRelationship(
         userAuthId,
         livestreamId,
         attributes
      )
   }

   /**
    * Helper function to update participation data on a livestream relationship
    * Uses prefixed attribute names to preserve any existing registration data
    * @param userAuthId The user's authentication ID
    * @param livestreamId The livestream identifier
    * @param data Optional participation data (timestamp, UTM)
    */
   public async updateParticipationData(
      userAuthId: string,
      livestreamId: string,
      data?: ParticipationRelationshipData
   ): Promise<void> {
      const attributes: Record<string, any> = {}

      if (data?.participatedAt) attributes.participated_at = data.participatedAt
      if (data?.utm) attributes.participation_utm = data.utm

      return this.createUserLivestreamRelationship(
         userAuthId,
         livestreamId,
         attributes
      )
   }

   /**
    * Helper function to clear registration data from a livestream relationship
    * Sets registration attributes to null while preserving participation data
    * @param userAuthId The user's authentication ID
    * @param livestreamId The livestream identifier
    */
   public async clearRegistrationData(
      userAuthId: string,
      livestreamId: string
   ): Promise<void> {
      const attributes: Record<string, any> = {
         registered_at: null,
         registration_utm: null,
         registration_origin_source: null,
      }

      return this.createUserLivestreamRelationship(
         userAuthId,
         livestreamId,
         attributes
      )
   }

   /**
    * Helper function to update seen data on a livestream relationship
    * Uses prefixed attribute names to preserve any existing registration and participation data
    * @param userAuthId The user's authentication ID
    * @param livestreamId The livestream identifier
    * @param data Optional seen data (firstSeenAt, lastSeenAt, viewCount, firstUtm, lastUtm)
    */
   public async updateSeenData(
      userAuthId: string,
      livestreamId: string,
      data?: SeenRelationshipData
   ): Promise<void> {
      const attributes: Record<string, any> = {}

      if (data?.firstSeenAt) attributes.seen_first_at = data.firstSeenAt
      if (data?.lastSeenAt) attributes.seen_last_at = data.lastSeenAt
      if (data?.viewCount !== undefined)
         attributes.seen_view_count = data.viewCount
      if (data?.firstUtm) attributes.seen_first_utm = data.firstUtm
      if (data?.lastUtm) attributes.seen_last_utm = data.lastUtm

      return this.createUserLivestreamRelationship(
         userAuthId,
         livestreamId,
         attributes
      )
   }
}
