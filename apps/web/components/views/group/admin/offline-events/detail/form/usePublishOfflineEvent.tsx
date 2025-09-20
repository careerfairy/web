import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import { useCallback, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useOfflineEventCreationContext } from "../OfflineEventCreationContext"
import { buildDraftOfflineEventObject } from "./OfflineEventFormikProvider"
import { useOfflineEventFormValues } from "./useOfflineEventFormValues"

export const usePublishOfflineEvent = () => {
   const router = useRouter()
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
            street: updatedOfflineEvent.street,
            startAt: updatedOfflineEvent.startAt,
            status: "upcoming", // Change status from draft to upcoming
         }

         // Update the offline event in Firebase
         await offlineEventService
            .updateOfflineEvent(publishData, author)
            .then(() => {
               enqueueSnackbar("Offline event published successfully!", {
                  variant: "success",
               })
               router.push(`/group/${group.id}/admin/content/offline-events`)
            })

         // enqueueSnackbar("Offline event published successfully!", {
         //    variant: "success",
         // })

         // router.push(`/group/${group.id}/admin/content/offline-events`)
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
      router,
   ])

   return { isPublishing, publishOfflineEvent }
}
