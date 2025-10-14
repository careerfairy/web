import {
   CustomerIOUserData,
   CUTOFF_DATE,
   toUnixTimestamp,
   transformLivestreamDataForCustomerIO,
   transformUserDataForCustomerIO,
} from "@careerfairy/shared-lib/customerio"
import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/firestore"
import { onRequest } from "firebase-functions/https"
import { auth } from "../../api/firestoreAdmin"
import {
   objectsClient,
   relationshipsClient,
   userRepo,
} from "../../api/repositories"
import {
   customerIOWebhookSignatureMiddleware,
   withMiddlewares,
} from "../../middlewares-gen2/onRequest"
import { ChangeType, getChangeTypeEnum, isLocalEnvironment } from "../../util"
import { trackingClient } from "./client"
import { OBJECT_TYPES } from "./objectsClient"
import { CustomerIOWebhookEvent } from "./types"

/**
 * Set to false when running backfill
 */
const CHECK_FOR_CHANGES = false

/**
 * Set to false when running relationship backfill to force sync all relationships
 */
const CHECK_FOR_RELATIONSHIP_CHANGES = true

export const syncUserToCustomerIO = onDocumentWritten(
   {
      document: "userData/{userId}",
      maxInstances: 70, // CustomerIO has a fair-use rate limit of 100 requests/second
      concurrency: 1, // Process updates sequentially to avoid rate limit issues
   },
   async (event) => {
      if (isLocalEnvironment()) {
         logger.info(
            "Skipping CustomerIO sync in local environment, remove this check if you want to sync to CustomerIO dev workspace"
         )
         return
      }

      const after = event.data?.after?.data() as UserData
      const before = event.data?.before?.data() as UserData

      const authId = after?.authId || before?.authId

      // Document was deleted
      if (!after) {
         try {
            await trackingClient.destroy(authId)
            logger.info(`Removed user ${authId} from CustomerIO`)
         } catch (error) {
            logger.error(
               `Failed to remove deleted user ${authId} from CustomerIO`,
               error
            )
         }
         return
      }

      if (shouldSyncUser(after)) {
         const userRecord = await auth.getUser(authId)

         if (!userRecord?.emailVerified) {
            logger.info(
               `User ${authId} email not verified, skipping sync to CustomerIO`
            )
            return
         }

         const oldData = before ? transformUserDataForCustomerIO(before) : null
         const newData = transformUserDataForCustomerIO(after)

         // Only sync if data has actually changed
         if (CHECK_FOR_CHANGES && !hasCustomerIODataChanged(oldData, newData)) {
            logger.info(
               `No changes detected for user ${authId}, skipping sync to CustomerIO`
            )
            return
         }

         try {
            await trackingClient.identify(authId, newData)
            logger.info(`Synced user ${authId} to CustomerIO`)
         } catch (error) {
            logger.error(`Failed to sync user ${authId} to CustomerIO`, error)
         }
      } else {
         // User is not active, remove from CustomerIO

         try {
            // Always attempt to remove from CustomerIO if they should be excluded
            // This ensures cleanup of any historical data
            await trackingClient.destroy(authId)
            logger.info(
               `Removed user ${authId} from CustomerIO - Reason: ${getReasonForExclusion(
                  after
               )}`
            )
         } catch (error) {
            // If user doesn't exist in CustomerIO, this will error but that's ok
            if (error?.response?.status !== 404) {
               logger.error(
                  `Failed to remove user ${authId} from CustomerIO`,
                  error
               )
            }
         }
         return
      }
   }
)

const shouldSyncUser = (user: UserData) => {
   return (
      user.lastActivityAt && // User has an activity date
      user.lastActivityAt.toDate() >= CUTOFF_DATE // User is active since before Sept 2023
   )
}

const getReasonForExclusion = (user: UserData) => {
   if (!user.lastActivityAt) {
      return "no activity date"
   }

   const lastActivityDate = user.lastActivityAt.toDate()
   if (lastActivityDate < CUTOFF_DATE) {
      return `inactive since before ${CUTOFF_DATE.toLocaleDateString()} (last activity: ${lastActivityDate.toLocaleDateString()})`
   }

   return "unknown"
}

/**
 * Checks if CustomerIO data has changed between versions using deep comparison
 */
const hasCustomerIODataChanged = (
   oldData: CustomerIOUserData | null,
   newData: CustomerIOUserData
): boolean => {
   if (!oldData) return true
   return JSON.stringify(oldData) !== JSON.stringify(newData)
}

/**
 * Syncs livestream metadata to Customer.io as objects
 * Firestore trigger on livestreams/{livestreamId}
 */
export const syncLivestreamToCustomerIO = onDocumentWritten(
   {
      document: "livestreams/{livestreamId}",
      maxInstances: 70, // CustomerIO has a fair-use rate limit of 100 requests/second
      concurrency: 1, // Process updates sequentially to avoid rate limit issues
   },
   async (event) => {
      if (isLocalEnvironment()) {
         logger.info(
            "Skipping CustomerIO livestream sync in local environment, remove this check if you want to sync to CustomerIO dev workspace"
         )
         return
      }

      try {
         const changeType = getChangeTypeEnum(event)
         const livestreamId = event.params.livestreamId

         logger.info(
            `Processing ${changeType} for livestream ${livestreamId} in CustomerIO`
         )

         switch (changeType) {
            case ChangeType.CREATE: {
               const livestream = event.data.after.data() as LivestreamEvent

               if (shouldSyncLivestream(livestream)) {
                  const livestreamData =
                     transformLivestreamDataForCustomerIO(livestream)

                  await objectsClient.createOrUpdateObject(
                     OBJECT_TYPES.LIVESTREAMS,
                     livestreamId,
                     livestreamData
                  )

                  logger.info(
                     `Successfully created livestream ${livestreamId} in CustomerIO`
                  )
               } else {
                  logger.info(
                     `Skipping CustomerIO sync for livestream ${livestreamId} - Reason: ${getLivestreamExclusionReason(
                        livestream
                     )}`
                  )
               }
               break
            }

            case ChangeType.UPDATE: {
               const livestream = event.data.after.data() as LivestreamEvent

               if (shouldSyncLivestream(livestream)) {
                  const livestreamData =
                     transformLivestreamDataForCustomerIO(livestream)

                  await objectsClient.createOrUpdateObject(
                     OBJECT_TYPES.LIVESTREAMS,
                     livestreamId,
                     livestreamData
                  )

                  logger.info(
                     `Successfully updated livestream ${livestreamId} in CustomerIO`
                  )
               } else {
                  // Livestream no longer qualifies (became test/hidden/draft)
                  await objectsClient.deleteObject(
                     OBJECT_TYPES.LIVESTREAMS,
                     livestreamId
                  )

                  logger.info(
                     `Removed livestream ${livestreamId} from CustomerIO - Reason: ${getLivestreamExclusionReason(
                        livestream
                     )}`
                  )
               }
               break
            }

            case ChangeType.DELETE: {
               // Document was deleted from Firestore, remove from CustomerIO
               logger.info(
                  `Processing deletion of livestream ${livestreamId} from CustomerIO (document deleted from Firestore)`
               )

               await objectsClient.deleteObject(
                  OBJECT_TYPES.LIVESTREAMS,
                  livestreamId
               )
               break
            }

            default:
               logger.warn(
                  `Unknown change type ${changeType} for livestream ${livestreamId} in CustomerIO sync`
               )
         }
      } catch (error) {
         logger.error("Error syncing livestream to CustomerIO:", error)
      }
   }
)

/**
 * Determines if a livestream should be synced to Customer.io
 * Excludes test, hidden, and draft livestreams per marketing requirements
 */
const shouldSyncLivestream = (livestream: LivestreamEvent): boolean => {
   return !livestream.test
}

/**
 * Returns a human-readable reason why a livestream is excluded from Customer.io sync
 */
const getLivestreamExclusionReason = (livestream: LivestreamEvent): string => {
   const reasons: string[] = []

   if (livestream.test) reasons.push("test event")

   return reasons.length > 0 ? reasons.join(", ") : "unknown"
}

/**
 * Checks if seen data has changed between old and new UserLivestreamData
 */
const hasSeenDataChanged = (
   oldData: UserLivestreamData | null,
   newData: UserLivestreamData
): boolean => {
   const hadSeen = Boolean(oldData?.seen?.firstSeenAt)
   const hasSeen = Boolean(newData?.seen?.firstSeenAt)

   // If seen status changed (first view or cleared)
   if (hadSeen !== hasSeen) {
      return true
   }

   // If user has seen the livestream, check if lastSeenAt or viewCount changed
   if (hasSeen) {
      return (
         oldData?.seen?.lastSeenAt?.toMillis() !==
            newData?.seen?.lastSeenAt?.toMillis() ||
         oldData?.seen?.viewCount !== newData?.seen?.viewCount
      )
   }

   return false
}

/**
 * Tracks Customer.io relationship changes for registration, participation, and seen data
 * Updates or clears specific attribute sets while preserving the relationship for future attributes
 */
const trackCustomerIORelationships = async (
   livestreamId: string,
   oldUserLivestreamData: UserLivestreamData | null,
   newUserLivestreamData: UserLivestreamData,
   userData: UserData
): Promise<void> => {
   if (isLocalEnvironment()) {
      logger.info(
         `Skipping Customer.io relationships for user ${userData.id} and livestream ${livestreamId} in local environment`
      )
      return
   }

   const userAuthId = userData.authId

   try {
      // Track registration, participation, and seen changes
      const wasRegistered = Boolean(oldUserLivestreamData?.registered?.date)
      const isRegistered = Boolean(newUserLivestreamData?.registered?.date)
      const wasParticipating = Boolean(
         oldUserLivestreamData?.participated?.date
      )
      const isParticipating = Boolean(newUserLivestreamData?.participated?.date)
      const hasSeen = Boolean(newUserLivestreamData?.seen?.firstSeenAt)

      // Handle registration changes
      const shouldUpdateRegistration = CHECK_FOR_RELATIONSHIP_CHANGES
         ? !wasRegistered && isRegistered // Only on new registration
         : isRegistered // Force update during backfill if registered

      const shouldClearRegistration = CHECK_FOR_RELATIONSHIP_CHANGES
         ? wasRegistered && !isRegistered // Only on deregistration
         : false // Never clear during backfill

      if (shouldUpdateRegistration) {
         // User just registered - add registration data
         await relationshipsClient.updateRegistrationData(
            userAuthId,
            livestreamId,
            {
               registeredAt: toUnixTimestamp(
                  newUserLivestreamData.registered?.date
               ),
               utm: newUserLivestreamData.registered?.utm,
               originSource: newUserLivestreamData.registered?.originSource,
            }
         )
         logger.info(
            `Updated Customer.io registration data: user ${userAuthId} -> livestream ${livestreamId}`
         )
      } else if (shouldClearRegistration) {
         // User deregistered - clear registration attributes
         await relationshipsClient.clearRegistrationData(
            userAuthId,
            livestreamId
         )
         logger.info(
            `Cleared Customer.io registration data: user ${userAuthId} -> livestream ${livestreamId}`
         )
      }

      // Handle participation changes
      const shouldUpdateParticipation = CHECK_FOR_RELATIONSHIP_CHANGES
         ? !wasParticipating && isParticipating // Only on new participation
         : isParticipating // Force update during backfill if participated

      if (shouldUpdateParticipation) {
         // User just participated - add participation data
         await relationshipsClient.updateParticipationData(
            userAuthId,
            livestreamId,
            {
               participatedAt: toUnixTimestamp(
                  newUserLivestreamData.participated?.date
               ),
               utm: newUserLivestreamData.participated?.utm,
            }
         )
         logger.info(
            `Updated Customer.io participation data: user ${userAuthId} -> livestream ${livestreamId}`
         )
      }

      // Handle seen data changes
      const shouldUpdateSeen = CHECK_FOR_RELATIONSHIP_CHANGES
         ? hasSeenDataChanged(oldUserLivestreamData, newUserLivestreamData) &&
           hasSeen // Only on seen data change
         : hasSeen // Force update during backfill if seen

      if (shouldUpdateSeen) {
         // User has viewed the livestream - update seen data
         await relationshipsClient.updateSeenData(userAuthId, livestreamId, {
            firstSeenAt: toUnixTimestamp(
               newUserLivestreamData.seen?.firstSeenAt
            ),
            lastSeenAt: toUnixTimestamp(newUserLivestreamData.seen?.lastSeenAt),
            viewCount: newUserLivestreamData.seen?.viewCount,
            firstUtm: newUserLivestreamData.seen?.firstUtm,
            lastUtm: newUserLivestreamData.seen?.lastUtm,
         })
         logger.info(
            `Updated Customer.io seen data: user ${userAuthId} -> livestream ${livestreamId} (viewCount: ${newUserLivestreamData.seen?.viewCount})`
         )
      }
   } catch (error) {
      // Log error but don't fail the entire registration process
      logger.error(
         `Failed to update Customer.io relationships for user ${userAuthId} and livestream ${livestreamId}:`,
         error
      )
   }
}

/**
 * Cloud function to handle Customer.io relationship tracking
 * Triggered by document writes to userLivestreamData subcollection
 */
export const syncUserLivestreamRelationships = onDocumentWritten(
   {
      document: "livestreams/{livestreamId}/userLivestreamData/{userEmail}",
      maxInstances: 70, // CustomerIO has a fair-use rate limit of 100 requests/second
      concurrency: 1, // Process updates sequentially to avoid rate limit issues
   },
   async (event) => {
      if (isLocalEnvironment()) {
         logger.info(
            "Skipping CustomerIO relationship sync in local environment, remove this check if you want to sync to CustomerIO dev workspace"
         )
         return
      }

      const { params } = event
      const { livestreamId, userEmail } = params

      logger.info(
         `Processing Customer.io relationship changes for livestream ${livestreamId} and user ${userEmail}`
      )

      const newUserLivestreamData =
         event.data.after?.data() as UserLivestreamData
      const oldUserLivestreamData =
         event.data.before?.data() as UserLivestreamData

      if (!newUserLivestreamData) {
         logger.info(
            `User livestream data deleted for ${userEmail} on livestream ${livestreamId}, skipping Customer.io relationship tracking`
         )
         return
      }

      try {
         // Get user data to access authId
         const userData = await userRepo.getUserDataById(userEmail)

         if (!userData || !userData.authId) {
            logger.warn(
               `Unable to process Customer.io relationships for user ${userEmail}: user data not found or missing authId`
            )
            return
         }

         if (!shouldSyncUser(userData)) {
            logger.info(
               `Skipping Customer.io relationship sync for user ${userEmail} - Reason: ${getReasonForExclusion(
                  userData
               )}`
            )
            return
         }

         await trackCustomerIORelationships(
            livestreamId,
            oldUserLivestreamData,
            newUserLivestreamData,
            userData
         )
      } catch (error) {
         logger.error(
            `Failed to track Customer.io relationships for user ${userEmail} and livestream ${livestreamId}:`,
            error
         )
      }
   }
)

/**
 * Handles Customer.io webhook events for unsubscribes, subscribes. To add other events, go to:
 * https://fly.customer.io/workspaces/175425/journeys/integrations/reporting-webhooks
 */
export const customerIOWebhook = onRequest(
   withMiddlewares(
      [
         customerIOWebhookSignatureMiddleware(
            process.env.CUSTOMERIO_REPORTING_SIGNING_KEY
         ),
      ],
      async (request, response) => {
         if (request.method !== "POST") {
            response.status(405).send("Method Not Allowed")
            return
         }

         const event = request.body as CustomerIOWebhookEvent

         try {
            switch (event.metric) {
               case "subscribed":
               case "unsubscribed": {
                  const userEmail = event.data.identifiers.email
                  logger.info(
                     `Updating subscription status for user ${userEmail} to ${event.metric}`
                  )
                  try {
                     await userRepo.updateUserData(userEmail, {
                        unsubscribed: event.metric === "unsubscribed",
                     })
                     logger.info(
                        `Updated subscription status for user ${userEmail} to ${event.metric}`
                     )
                  } catch (error) {
                     logger.warn(
                        `Failed to update subscription status for user ${userEmail}`,
                        error
                     )
                  }
                  response.status(200).send("OK")
                  break
               }
               default: {
                  // Acknowledge other events but don't process them
                  logger.info(`Received unhandled event type: ${event.metric}`)
                  response.status(200).send("OK")
               }
            }
         } catch (error) {
            logger.error(
               `Error processing ${event.metric} webhook for user ${event.data?.identifiers?.email}`,
               event,
               error
            )
            response.status(500).send("Internal Server Error")
         }
      }
   )
)
