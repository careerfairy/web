import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useState } from "react"
import { useDispatch } from "react-redux"
import { getLinkToStream } from "util/streamUtil"
import * as actions from "store/actions"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"
import { UserReminderType } from "@careerfairy/shared-lib/dist/users"
import { useUserReminders } from "HOCs/UserReminderProvider"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"

const useRegistrationModal = (
   // if redirected to signup when clicking
   // and the user has finished signing up
   // they should be re-directed to the origin path
   useCurrentPath?: boolean
) => {
   const firebase = useFirebaseService()
   const {
      push,
      query: { groupId },
      asPath,
   } = useRouter()
   const { isLoggedIn, userData } = useAuth()
   const { forceShowReminder } = useUserReminders()
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined)
   const handleCloseJoinModal = useCallback(
      () => setJoinGroupModalData(undefined),
      []
   )
   const dispatch = useDispatch()

   const handleOpenJoinModal = useCallback(
      (groups: any[], targetGroupId: string, livestream: LivestreamEvent) =>
         setJoinGroupModalData({
            groups: groups,
            targetGroupId,
            livestream,
         }),
      []
   )

   const handleClickRegister = useCallback(
      async (
         event: LivestreamEvent,
         targetGroupId: string,
         groups: any[],
         hasRegistered: boolean
      ) => {
         dataLayerLivestreamEvent("event_registration_started", event)
         try {
            if (hasRegistered) {
               await firebase.deregisterFromLivestream(event.id, userData)
               recommendationServiceInstance.unRegisterEvent(
                  event.id,
                  userData.authId
               )
               dataLayerLivestreamEvent("event_registration_removed", event)
            } else {
               const emailVerified = firebase.auth?.currentUser?.emailVerified
               if (!isLoggedIn || !emailVerified) {
                  dataLayerLivestreamEvent(
                     "event_registration_started_login_required",
                     event
                  )
                  return push({
                     pathname: `/login`,
                     query: {
                        absolutePath: getLinkToStream(
                           event,
                           groupId as string,
                           true,
                           useCurrentPath ? asPath : undefined
                        ),
                     },
                  })
               }
               // Try to force show newsletter reminder
               forceShowReminder(UserReminderType.NewsletterReminder)
               return handleOpenJoinModal(groups, targetGroupId, event)
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
      },
      [
         firebase,
         userData,
         isLoggedIn,
         forceShowReminder,
         handleOpenJoinModal,
         push,
         groupId,
         useCurrentPath,
         asPath,
         dispatch,
      ]
   )

   return { handleClickRegister, joinGroupModalData, handleCloseJoinModal }
}

export default useRegistrationModal
