import { TrackOfflineEventActionRequest } from "@careerfairy/shared-lib/functions/types"
import {
   OfflineEvent,
   OfflineEventStats,
   OfflineEventStatsAction,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { Timestamp, UpdateData } from "firebase-admin/firestore"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { CallableRequest, onCall } from "firebase-functions/v2/https"
import { mixed, object, string } from "yup"
import { offlineEventRepo } from "../../api/repositories"
import { withMiddlewares } from "../../middlewares-gen2/onCall/middleware"
import {
   dataValidationMiddleware,
   userAuthExistsMiddleware,
} from "../../middlewares-gen2/onCall/validations"
import { ChangeType, getChangeTypeEnum } from "../../util"
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

            // Track the action based on type
            await offlineEventRepo.trackOfflineEventAction(
               offlineEventId,
               userData,
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
 * Cloud function that triggers when an offline event is created or updated
 * - On CREATE: Creates an OfflineEventStats document with initial empty stats
 * - On UPDATE: Syncs the updated offline event to its embedding in the stats document
 * - On DELETE: Marks the stats document as deleted
 */
export const onWriteOfflineEvent = onDocumentWritten(
   "offlineEvents/{offlineEventId}",
   async (event) => {
      try {
         const offlineEventId = event.params.offlineEventId
         const changeType = getChangeTypeEnum(event)

         functions.logger.info(
            `Processing ${changeType} for offline event: ${offlineEventId}`
         )

         switch (changeType) {
            case ChangeType.CREATE: {
               const offlineEvent: OfflineEvent = {
                  ...(event.data.after.data() as OfflineEvent),
                  id: offlineEventId,
               }

               // Create new stats document with initial empty stats
               const offlineEventStats: OfflineEventStats = {
                  id: offlineEventId,
                  documentType: "offlineEventStats",
                  deleted: false,
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

               await event.data.after.ref.firestore
                  .collection("offlineEventStats")
                  .doc(offlineEventId)
                  .set(offlineEventStats)

               functions.logger.info(
                  `Successfully created stats for offline event: ${offlineEventId}`
               )
               break
            }

            case ChangeType.UPDATE: {
               const offlineEvent: OfflineEvent = {
                  ...(event.data.after.data() as OfflineEvent),
                  id: offlineEventId,
               }

               const updateData: UpdateData<OfflineEventStats> = {
                  offlineEvent,
                  updatedAt: Timestamp.now(),
               }

               // Update the embedded offline event in the stats document
               await event.data.after.ref.firestore
                  .collection("offlineEventStats")
                  .doc(offlineEventId)
                  .update(updateData)

               functions.logger.info(
                  `Successfully synced offline event to stats: ${offlineEventId}`
               )
               break
            }

            case ChangeType.DELETE: {
               functions.logger.info(
                  `Offline event deleted: ${offlineEventId}, marking stats as deleted`
               )

               const updateData: UpdateData<OfflineEventStats> = {
                  deleted: true,
               }

               await event.data.after.ref.firestore
                  .collection("offlineEventStats")
                  .doc(offlineEventId)
                  .update(updateData)

               functions.logger.info(
                  `Successfully marked stats as deleted: ${offlineEventId}`
               )
               break
            }

            default:
               functions.logger.warn(
                  `Unknown change type for offline event: ${offlineEventId}`
               )
         }
      } catch (error) {
         functions.logger.error("Error processing offline event change:", error)
      }
   }
)
