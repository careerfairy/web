import { AuthorInfo } from "@careerfairy/shared-lib/livestreams/livestreams"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { useAuth } from "HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import {
   buildDraftOfflineEventObject,
   getFormInitialValues,
} from "./detail/form/OfflineEventFormikProvider"

type Result = {
   /**
    * Edits a given offline event, redirects to the offline event detail page
    * @param offlineEventId
    * @returns void
    */
   editOfflineEvent: (offlineEventId: string) => void
   /**
    * Creates a draft offline event, then redirects to the offline event detail OfflineEventsPage
    * using the created id
    * @returns void
    */
   createDraftOfflineEvent: () => Promise<boolean>
   /**
    * Whether the offline event is being created
    * @returns boolean
    */
   isCreating: boolean
}

export const useOfflineEventRouting = (): Result => {
   const { group } = useGroup()
   const router = useRouter()
   const firebase = useFirebaseService()
   const { authenticatedUser } = useAuth()

   const [isCreating, setIsCreating] = useState(false)

   const handleCreateDraftOfflineEvent = async () => {
      if (group.availableOfflineEvents <= 0) {
         router.push(
            `/group/${group.id}/admin/content/offline-events?showOutOfEventsDialog=true`
         )
         return
      }

      setIsCreating(true)

      const author: AuthorInfo = {
         groupId: group?.id,
         authUid: authenticatedUser?.uid,
      }

      const initialValues = getFormInitialValues()

      const draftOfflineEvent: OfflineEvent = buildDraftOfflineEventObject(
         initialValues,
         group,
         author,
         firebase
      )

      try {
         return offlineEventService
            .createOfflineEvent(draftOfflineEvent, author)
            .then(async (eventId) => {
               return offlineEventService
                  .decreaseGroupAvailableOfflineEvents(group.id)
                  .then(async () => Promise.resolve(eventId))
                  .catch((error) => {
                     errorLogAndNotify(error, {
                        message:
                           "Failed to decrease group available offline events",
                        groupId: group.id,
                        draftOfflineEventId: eventId,
                     })
                  })
            })
            .then((eventId) =>
               router.push({
                  pathname: `/group/${group.id}/admin/content/offline-events/${eventId}`,
               })
            )
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to create draft offline event",
            groupId: group.id,
         })
      } finally {
         setIsCreating(false)
      }
   }

   const editOfflineEvent = (offlineEventId: string) => {
      return router.push({
         pathname: `/group/${group.id}/admin/content/offline-events/${offlineEventId}`,
      })
   }

   return {
      editOfflineEvent,
      createDraftOfflineEvent: handleCreateDraftOfflineEvent,
      isCreating,
   }
}
