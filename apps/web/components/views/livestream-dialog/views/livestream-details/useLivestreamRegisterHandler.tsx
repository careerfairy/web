import { UserReminderType } from "@careerfairy/shared-lib/src/users"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { recommendationServiceInstance } from "../../../../../data/firebase/RecommendationService"
import UserUtil from "../../../../../data/util/UserUtil"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { useUserReminders } from "../../../../../HOCs/UserReminderProvider"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { useLiveStreamDialog } from "../../LivestreamDialog"

/**
 * Logic for handling the register button click
 */
export const useLivestreamRegisterHandler = () => {
   const { livestream, livestreamPresenter, serverUserEmail, goToView } =
      useLiveStreamDialog()
   const { push, asPath } = useRouter()
   const { forceShowReminder } = useUserReminders()
   const firebase = useFirebaseService()
   const { authenticatedUser, isLoggedOut, userData } = useAuth()
   const { errorNotification } = useSnackbarNotifications()

   const handleRegisterClick = useCallback(
      async (floating: boolean) => {
         // Check if the user is already registered
         try {
            const isAlreadyRegistered = livestreamPresenter.isUserRegistered(
               authenticatedUser.email || serverUserEmail
            )

            if (isAlreadyRegistered) {
               await firebase.deregisterFromLivestream(livestream.id, userData)
               recommendationServiceInstance.unRegisterEvent(
                  livestream.id,
                  userData.authId
               )
               dataLayerLivestreamEvent(
                  "event_registration_removed",
                  livestream
               )
            } else {
               dataLayerLivestreamEvent(
                  `event_registration_started${
                     floating ? "_from_footer_button" : ""
                  }`,
                  livestream
               )

               if (isLoggedOut || !authenticatedUser?.emailVerified) {
                  dataLayerLivestreamEvent(
                     "event_registration_started_login_required",
                     livestream
                  )
                  return push({
                     pathname: `/login`,
                     query: { absolutePath: asPath },
                  })
               }

               if (!userData || !UserUtil.userProfileIsComplete(userData)) {
                  dataLayerLivestreamEvent(
                     "event_registration_started_profile_incomplete",
                     livestream
                  )
                  return push({
                     pathname: `/profile`,
                     query: { absolutePath: asPath },
                  })
               }

               // Try to force show newsletter reminder
               forceShowReminder(UserReminderType.NewsletterReminder)
               goToView("register-data-consent")
            }
         } catch (e) {
            errorNotification(e)
         }
      },
      [
         asPath,
         authenticatedUser.email,
         authenticatedUser?.emailVerified,
         errorNotification,
         firebase,
         forceShowReminder,
         goToView,
         isLoggedOut,
         livestream,
         livestreamPresenter,
         push,
         serverUserEmail,
         userData,
      ]
   )

   return handleRegisterClick
}

export default useLivestreamRegisterHandler
