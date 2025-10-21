import { Group } from "@careerfairy/shared-lib/groups"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import * as functions from "firebase-functions"
import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { firestore } from "./api/firestoreAdmin"
import { userRepo } from "./api/repositories"
import { notifyOfflineEventPublished } from "./api/slack"
import config from "./config"
import { defaultTriggerRunTimeConfig } from "./lib/triggers/util"

/**
 * Sends a Slack notification when an offline event is published.
 *
 * Triggered when an offline event document is updated and the `published` field
 * changes from `false` to `true`.
 */
export const notifySlackWhenOfflineEventIsPublished = onDocumentUpdated(
   {
      ...defaultTriggerRunTimeConfig,
      document: "offlineEvents/{offlineEventId}",
   },
   async (event) => {
      try {
         const before = event.data.before.data() as OfflineEvent
         const offlineEvent = event.data.after.data() as OfflineEvent

         if (!offlineEvent) return

         const beforePublished = before?.published
         const afterPublished = offlineEvent.published

         // Check if the event was just published (transitioned from draft to published)
         const wasJustPublished = !beforePublished && afterPublished

         if (wasJustPublished) {
            functions.logger.info(
               `Offline event ${offlineEvent.id} was just published, sending notification to Slack`
            )

            // Get the group's remaining credits
            const groupDoc = await firestore
               .collection("careerCenterData")
               .doc(offlineEvent.group.id)
               .get()

            const lastUpdatedBy = await userRepo.getUserDataByUid(
               offlineEvent.lastUpdatedBy.authUid
            )

            const group = groupDoc.data() as Group

            const remainingCredits = group?.availableOfflineEvents || 0

            await notifyOfflineEventPublished(
               config.slackWebhooks.offlineEventPublished,
               {
                  companyName: group.universityName,
                  publisherName: `${lastUpdatedBy.firstName} ${lastUpdatedBy.lastName}`,
                  publisherEmail: lastUpdatedBy.userEmail,
                  eventTitle: offlineEvent.title,
                  eventId: offlineEvent.id,
                  eventDate: offlineEvent.startAt.toDate(),
                  groupId: offlineEvent.group.id,
                  remainingCredits,
                  eventImageUrl: offlineEvent.backgroundImageUrl,
               }
            )

            functions.logger.log(
               `Offline event ${event.params.offlineEventId} published notification sent to Slack`
            )
         } else {
            functions.logger.log(
               "Skipping offline event notification - event was not just published"
            )
         }
      } catch (e) {
         functions.logger.error(
            "Error notifying Slack when offline event is published",
            event.params.offlineEventId,
            e
         )
      }
   }
)
