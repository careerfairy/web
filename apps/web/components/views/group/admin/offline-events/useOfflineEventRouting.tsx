import { pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
import { AuthorInfo } from "@careerfairy/shared-lib/livestreams/livestreams"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { useAuth } from "HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useGroup } from "layouts/GroupDashboardLayout"
import { DateTime } from "luxon"
import { useRouter } from "next/router"
import { useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

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
   createDraftOfflineEvent: () => Promise<void>
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
         errorLogAndNotify(new Error("Error creating draft offline event"), {
            message:
               "Draft offline event could not be created: no available offline event slots for this group",
            groupId: group.id,
         })
         return
      }

      setIsCreating(true)

      const author: AuthorInfo = {
         groupId: group?.id,
         authUid: authenticatedUser?.uid,
      }

      // TODO: In next stack there will be dedicated functions in the form provider for building the initial values
      const initialValues = {
         title: "",
         description: "",
         city: null,
         street: "",
         targetAudience: {
            universities: [],
            levelOfStudies: [],
            fieldOfStudies: [],
         },
         registrationUrl: "",
         startAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
         backgroundImageUrl: "",
         hidden: false,
      }

      // TODO: In next stack there will be dedicated functions in the form provider for building the draft offline event
      const draftOfflineEvent: Partial<OfflineEvent> = {
         group: pickPublicDataFromGroup(group),
         title: initialValues.title,
         description: initialValues.description,
         targetAudience: initialValues.targetAudience,
         registrationUrl: initialValues.registrationUrl,
         backgroundImageUrl: initialValues.backgroundImageUrl,
         hidden: initialValues.hidden,
         company: {
            name: group.universityName,
            groupId: group.id,
         },
         address: {
            countryISOCode: group.companyCountry,
            cityISOCode: initialValues.city,
            street: initialValues.street,
         },
         status: "draft",
         industries: group.companyIndustries,
         author: author,
         startAt: firebase.getFirebaseTimestamp(initialValues.startAt),
         createdAt: firebase.getFirebaseTimestamp(new Date()),
         updatedAt: firebase.getFirebaseTimestamp(new Date()),
         lastUpdatedBy: author,
      }

      try {
         const draftOfflineEventId =
            await offlineEventService.createOfflineEvent(
               draftOfflineEvent,
               author
            )

         await offlineEventService.decreaseGroupAvailableOfflineEvents(group.id)

         router.push({
            pathname: `/group/${group.id}/admin/content/offline-events/${draftOfflineEventId}`,
         })
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
