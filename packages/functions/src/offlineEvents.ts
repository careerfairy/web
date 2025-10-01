import {
   TrackOfflineEventClickRequest,
   TrackOfflineEventViewRequest,
} from "@careerfairy/shared-lib/functions/types"
import {
   OfflineEvent,
   OfflineEventStats,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { pickPublicDataFromUser } from "@careerfairy/shared-lib/users"
import { Timestamp } from "firebase-admin/firestore"
import { onDocumentCreated } from "firebase-functions/v2/firestore"
import { CallableRequest, onCall } from "firebase-functions/v2/https"
import { offlineEventRepo, userRepo } from "./api/repositories"
import { withMiddlewares } from "./middlewares-gen2/onCall/middleware"
import { userAuthExistsMiddleware } from "./middlewares-gen2/onCall/validations"
import functions = require("firebase-functions")

/**
 * Cloud function to track when a user views an offline event (opens the dialog)
 * - Upserts OfflineEventUserStats with lastSeenAt
 * - Creates an OfflineEventAction with type "view"
 * - Updates OfflineEventStats to increment totalNumberOfTalentReached and uniqueNumberOfTalentReached if first view
 */
export const trackOfflineEventView = onCall(
   withMiddlewares(
      [userAuthExistsMiddleware()],
      async (request: CallableRequest<TrackOfflineEventViewRequest>) => {
         try {
            const { offlineEventId } = request.data

            if (!offlineEventId) {
               throw new functions.https.HttpsError(
                  "invalid-argument",
                  "offlineEventId is required"
               )
            }

            // Get user data
            const userData = await userRepo.getUserDataById(
               request.auth.token.email
            )

            if (!userData) {
               throw new functions.https.HttpsError(
                  "not-found",
                  "User data not found"
               )
            }

            // Convert to public user data
            const userPublicData = pickPublicDataFromUser(userData)

            // Get UTM params from request data (passed from client)
            const utm = request.data.utm || null

            // Track the view
            await offlineEventRepo.trackOfflineEventView(
               offlineEventId,
               userPublicData,
               utm
            )

            return { success: true }
         } catch (error) {
            functions.logger.error("Error tracking offline event view:", error)
            throw new functions.https.HttpsError(
               "internal",
               "Failed to track offline event view"
            )
         }
      }
   )
)

/**
 * Cloud function to track when a user clicks the register button on an offline event
 * - Upserts OfflineEventUserStats with listClickedAt
 * - Creates an OfflineEventAction with type "click"
 * - Updates OfflineEventStats to increment totalNumberOfRegisterClicks and totalNumberOfUniqueRegisterClicks if first click
 */
export const trackOfflineEventClick = onCall(
   withMiddlewares(
      [userAuthExistsMiddleware()],
      async (request: CallableRequest<TrackOfflineEventClickRequest>) => {
         try {
            if (!request.auth) {
               throw new functions.https.HttpsError(
                  "unauthenticated",
                  "User must be authenticated"
               )
            }

            const { offlineEventId } = request.data

            if (!offlineEventId) {
               throw new functions.https.HttpsError(
                  "invalid-argument",
                  "offlineEventId is required"
               )
            }

            // Get user data
            const userData = await userRepo.getUserDataById(
               request.auth.token.email
            )

            if (!userData) {
               throw new functions.https.HttpsError(
                  "not-found",
                  "User data not found"
               )
            }

            // Convert to public user data
            const userPublicData = pickPublicDataFromUser(userData)

            // Get UTM params from request data (passed from client)
            const utm = request.data.utm || null

            // Track the click
            await offlineEventRepo.trackOfflineEventClick(
               offlineEventId,
               userPublicData,
               utm
            )

            return { success: true }
         } catch (error) {
            functions.logger.error("Error tracking offline event click:", error)
            throw new functions.https.HttpsError(
               "internal",
               "Failed to track offline event click"
            )
         }
      }
   )
)

/**
 * Cloud function that triggers when a new offline event is created
 * - Creates an OfflineEventStats document with initial empty stats
 * - This ensures stats exist before any tracking occurs
 */
export const onCreateOfflineEvent = onDocumentCreated(
   "offlineEvents/{offlineEventId}",
   async (event) => {
      try {
         const offlineEventId = event.params.offlineEventId
         functions.logger.info(
            `Creating stats for offline event: ${offlineEventId}`
         )

         const offlineEvent: OfflineEvent = {
            ...(event.data.data() as OfflineEvent),
            id: offlineEventId,
         }

         const offlineEventStats: OfflineEventStats = {
            id: offlineEventId,
            documentType: "offlineEventStats",
            offlineEvent,
            generalStats: {
               totalNumberOfRegisterClicks: 0,
               totalNumberOfTalentReached: 0,
               uniqueNumberOfTalentReached: 0,
               totalNumberOfUniqueRegisterClicks: 0,
            },
            universityStats: {},
            countryStats: {},
            fieldOfStudyStats: {},
            updatedAt: Timestamp.now(),
         }

         // Create the stats document
         await event.data.ref.firestore
            .collection("offlineEventStats")
            .doc(offlineEventId)
            .set(offlineEventStats)

         functions.logger.info(
            `Successfully created stats for offline event: ${offlineEventId}`
         )
      } catch (error) {
         functions.logger.error("Error creating offline event stats:", error)
         // Don't throw - we don't want to fail the offline event creation
         // Stats can be manually created if needed
      }
   }
)
