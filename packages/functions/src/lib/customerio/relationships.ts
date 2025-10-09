import axios from "axios"
import { logger } from "firebase-functions"
import { isLocalEnvironment, isTestEnvironment } from "../../util"
import { OBJECT_TYPES } from "./objectsClient"

/**
 * Relationship types between users and livestream objects in Customer.io
 * These IDs are used to categorize different types of user-livestream interactions
 */
export const RELATIONSHIP_TYPES = {
   REGISTERED_TO_LIVESTREAM: 2,
   PARTICIPATED_IN_LIVESTREAM: 3,
} as const

type RelationshipTypeId =
   (typeof RELATIONSHIP_TYPES)[keyof typeof RELATIONSHIP_TYPES]

const getApiCredentials = () => {
   let siteId = process.env.CUSTOMERIO_SITE_ID
   let apiKey = process.env.CUSTOMERIO_TRACKING_API_KEY

   if (isLocalEnvironment()) {
      siteId = process.env.DEV_CUSTOMERIO_SITE_ID
      apiKey = process.env.DEV_CUSTOMERIO_TRACKING_API_KEY
   }

   return { siteId, apiKey }
}

const CUSTOMERIO_TRACK_API_URL = "https://track-eu.customer.io"

/**
 * Creates a relationship between a user and a livestream object in Customer.io
 * This enables segmentation based on user interactions with specific livestreams
 *
 * @param userAuthId The user's authentication ID (used as Customer.io user identifier)
 * @param livestreamId The livestream identifier
 * @param relationshipType The type of relationship (registered, participated, etc.)
 */
export async function createUserLivestreamRelationship(
   userAuthId: string,
   livestreamId: string,
   relationshipType: RelationshipTypeId
): Promise<void> {
   if (isTestEnvironment()) {
      logger.info(
         `[TEST] Would create Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId} (type: ${relationshipType})`
      )
      return
   }

   const { siteId, apiKey } = getApiCredentials()

   if (!siteId || !apiKey) {
      throw new Error("Customer.io credentials not configured")
   }

   const url = `${CUSTOMERIO_TRACK_API_URL}/api/v2/entity`
   const auth = Buffer.from(`${siteId}:${apiKey}`).toString("base64")

   logger.info(
      `Creating Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId} (type: ${relationshipType})`
   )

   try {
      await axios.post(
         url,
         {
            type: "object_relationship",
            action: "create",
            identifiers: {
               user_id: userAuthId,
               object_type_id: OBJECT_TYPES.LIVESTREAMS,
               object_id: livestreamId,
            },
            attributes: {
               type_id: relationshipType,
            },
         },
         {
            headers: {
               Authorization: `Basic ${auth}`,
               "Content-Type": "application/json",
            },
         }
      )

      logger.info(
         `Successfully created Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId} (type: ${relationshipType})`
      )
   } catch (error) {
      logger.error(
         `Failed to create Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId} (type: ${relationshipType})`,
         {
            error: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            userAuthId,
            livestreamId,
            relationshipType,
         }
      )
      throw error
   }
}

/**
 * Deletes a specific relationship between a user and a livestream object in Customer.io
 *
 * @param userAuthId The user's authentication ID
 * @param livestreamId The livestream identifier
 * @param relationshipType The type of relationship to delete
 */
export async function deleteUserLivestreamRelationship(
   userAuthId: string,
   livestreamId: string,
   relationshipType: RelationshipTypeId
): Promise<void> {
   if (isTestEnvironment()) {
      logger.info(
         `[TEST] Would delete Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId} (type: ${relationshipType})`
      )
      return
   }

   const { siteId, apiKey } = getApiCredentials()

   if (!siteId || !apiKey) {
      throw new Error("Customer.io credentials not configured")
   }

   const url = `${CUSTOMERIO_TRACK_API_URL}/api/v2/entity`
   const auth = Buffer.from(`${siteId}:${apiKey}`).toString("base64")

   try {
      await axios.delete(url, {
         headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
         },
         data: {
            type: "object_relationship",
            action: "delete",
            identifiers: {
               user_id: userAuthId,
               object_type_id: OBJECT_TYPES.LIVESTREAMS,
               object_id: livestreamId,
            },
            attributes: {
               type_id: relationshipType,
            },
         },
      })

      logger.info(
         `Successfully deleted Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId} (type: ${relationshipType})`
      )
   } catch (error) {
      // 404 errors are ok - relationship doesn't exist
      if (error?.response?.status === 404) {
         logger.info(
            `Customer.io relationship doesn't exist: user ${userAuthId} -> livestream ${livestreamId} (type: ${relationshipType}), skipping deletion`
         )
         return
      }

      logger.error(
         `Failed to delete Customer.io relationship: user ${userAuthId} -> livestream ${livestreamId} (type: ${relationshipType})`,
         {
            error: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            userAuthId,
            livestreamId,
            relationshipType,
         }
      )
      throw error
   }
}

/**
 * Deletes all relationships for a specific livestream
 * This should be called when a livestream is deleted to clean up orphaned relationships
 *
 * @param livestreamId The livestream identifier
 */
export async function deleteAllLivestreamRelationships(
   livestreamId: string
): Promise<void> {
   if (isTestEnvironment()) {
      logger.info(
         `[TEST] Would delete all Customer.io relationships for livestream ${livestreamId}`
      )
      return
   }

   logger.info(
      `Cleaning up all Customer.io relationships for livestream ${livestreamId}`
   )

   // Note: Customer.io doesn't provide a bulk delete endpoint for relationships
   // In practice, when we delete the livestream object, Customer.io should automatically
   // clean up associated relationships. This function serves as a placeholder for
   // any additional cleanup logic that might be needed in the future.

   logger.info(
      `Customer.io will automatically clean up relationships when livestream object ${livestreamId} is deleted`
   )
}

/**
 * Helper function to create a registration relationship
 */
export async function createRegistrationRelationship(
   userAuthId: string,
   livestreamId: string
): Promise<void> {
   return createUserLivestreamRelationship(
      userAuthId,
      livestreamId,
      RELATIONSHIP_TYPES.REGISTERED_TO_LIVESTREAM
   )
}

/**
 * Helper function to create a participation relationship
 */
export async function createParticipationRelationship(
   userAuthId: string,
   livestreamId: string
): Promise<void> {
   return createUserLivestreamRelationship(
      userAuthId,
      livestreamId,
      RELATIONSHIP_TYPES.PARTICIPATED_IN_LIVESTREAM
   )
}

/**
 * Helper function to delete a registration relationship
 */
export async function deleteRegistrationRelationship(
   userAuthId: string,
   livestreamId: string
): Promise<void> {
   return deleteUserLivestreamRelationship(
      userAuthId,
      livestreamId,
      RELATIONSHIP_TYPES.REGISTERED_TO_LIVESTREAM
   )
}

/**
 * Helper function to delete a participation relationship
 */
export async function deleteParticipationRelationship(
   userAuthId: string,
   livestreamId: string
): Promise<void> {
   return deleteUserLivestreamRelationship(
      userAuthId,
      livestreamId,
      RELATIONSHIP_TYPES.PARTICIPATED_IN_LIVESTREAM
   )
}
