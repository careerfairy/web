import { TrackOfflineEventActionRequest } from "@careerfairy/shared-lib/functions/types"
import {
   OfflineEvent,
   OfflineEventStats,
   OfflineEventStatsAction,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { pickPublicDataFromUser } from "@careerfairy/shared-lib/users"
import { Timestamp } from "firebase-admin/firestore"
import { onDocumentCreated } from "firebase-functions/v2/firestore"
import { CallableRequest, onCall } from "firebase-functions/v2/https"
import { mixed, object, string } from "yup"
import { offlineEventRepo } from "./api/repositories"
import { withMiddlewares } from "./middlewares-gen2/onCall/middleware"
import {
   dataValidationMiddleware,
   userAuthExistsMiddleware,
} from "./middlewares-gen2/onCall/validations"
import functions = require("firebase-functions")

/**
 * Consolidated cloud function to track offline event actions (view or click)
 * - For "view": Upserts OfflineEventUserStats with lastSeenAt, creates an OfflineEventAction,
 *   and increments totalNumberOfTalentReached and uniqueNumberOfTalentReached
 * - For "click": Upserts OfflineEventUserStats with listClickedAt, creates an OfflineEventAction,
 *   and increments totalNumberOfRegisterClicks and uniqueNumberOfRegisterClicks
 */
export const trackOfflineEventAction = onCall(
   withMiddlewares(
      [
         dataValidationMiddleware<TrackOfflineEventActionRequest>(
            object({
               offlineEventId: string().required(),
               actionType: mixed<OfflineEventStatsAction>()
                  .oneOf(Object.values(OfflineEventStatsAction))
                  .required(),
               utm: object().nullable(),
               userData: object().required() as any,
            })
         ),
         userAuthExistsMiddleware(),
      ],
      async (request: CallableRequest<TrackOfflineEventActionRequest>) => {
         try {
            const { offlineEventId, actionType, utm, userData } = request.data

            // Convert to public user data
            const userPublicData = pickPublicDataFromUser(userData)

            // Track the action based on type
            await offlineEventRepo.trackOfflineEventAction(
               offlineEventId,
               userPublicData,
               utm || null,
               actionType
            )

            return { success: true }
         } catch (error) {
            functions.logger.error(
               `Error tracking offline event ${request.data.actionType}:`,
               error
            )
            throw new functions.https.HttpsError(
               "internal",
               `Failed to track offline event ${request.data.actionType}`
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
               uniqueNumberOfRegisterClicks: 0,
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
      }
   }
)
