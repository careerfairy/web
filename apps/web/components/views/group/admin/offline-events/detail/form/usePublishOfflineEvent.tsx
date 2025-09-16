import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useSnackbar } from "notistack"
import { useCallback, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useOfflineEventCreationContext } from "../OfflineEventCreationContext"
import { buildDraftOfflineEventObject } from "./OfflineEventFormikProvider"
import { useOfflineEventFormValues } from "./useOfflineEventFormValues"

export const usePublishOfflineEvent = () => {
   const firebaseService = useFirebaseService()
   const { values, isValid } = useOfflineEventFormValues()
   const { offlineEvent, group, author } = useOfflineEventCreationContext()
   const { enqueueSnackbar } = useSnackbar()
   const [isPublishing, setIsPublishing] = useState(false)

   const publishOfflineEvent = useCallback(async () => {
      if (!isValid) {
         enqueueSnackbar("Form is invalid, please fix errors first.", {
            variant: "error",
         })
         return
      }

      if (!offlineEvent?.id) {
         enqueueSnackbar("Offline event not found", {
            variant: "error",
         })
         return
      }

      try {
         setIsPublishing(true)

         // Build the updated offline event object with current form values
         const updatedOfflineEvent = buildDraftOfflineEventObject(
            values,
            group,
            author,
            firebaseService
         )

         // Update the existing offline event with new data and status
         const publishData: Partial<OfflineEvent> = {
            ...offlineEvent,
            title: updatedOfflineEvent.title,
            description: updatedOfflineEvent.description,
            targetAudience: updatedOfflineEvent.targetAudience,
            registrationUrl: updatedOfflineEvent.registrationUrl,
            backgroundImageUrl: updatedOfflineEvent.backgroundImageUrl,
            hidden: updatedOfflineEvent.hidden,
            address: updatedOfflineEvent.address,
            startAt: updatedOfflineEvent.startAt,
            status: "upcoming", // Change status from draft to upcoming
         }

         // Update the offline event in Firebase
         await firebaseService.updateOfflineEvent(publishData, author)

         enqueueSnackbar("Offline event published successfully!", {
            variant: "success",
         })

         // TODO: Add navigation or other post-publish actions here
         // For example, redirect to the events list or refresh the page
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to publish offline event",
            offlineEventId: offlineEvent?.id,
            groupId: group?.id,
         })
         enqueueSnackbar("Failed to publish offline event", {
            variant: "error",
         })
      } finally {
         setIsPublishing(false)
      }
   }, [
      isValid,
      offlineEvent,
      enqueueSnackbar,
      values,
      group,
      author,
      firebaseService,
   ])

   return { isPublishing, publishOfflineEvent }
}
