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

   /**
    * Initiate the registration process
    */
   const initRegistrationProcess = useCallback(
      (floating: boolean) => {
         dataLayerLivestreamEvent("event_registration_started", livestream)

         if (floating) {
            dataLayerLivestreamEvent(
               "event_registration_started_from_footer_button",
               livestream
            )
         }

         // User profile must be complete
         if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            dataLayerLivestreamEvent(
               "event_registration_started_profile_incomplete",
               livestream
            )

            errorNotification(
               "Incomplete profile",
               "Please complete your profile before registering for this event"
            )

            return push({
               pathname: `/profile`,
               query: { absolutePath: asPath },
            })
         }

         // Try to force show newsletter reminder
         forceShowReminder(UserReminderType.NewsletterReminder)
         goToView("register-data-consent")
      },
      [
         asPath,
         errorNotification,
         forceShowReminder,
         goToView,
         livestream,
         push,
         userData,
      ]
   )

   /**
    * De-register from the livestream
    */
   const deRegisterLivestream = useCallback(async () => {
      await firebase.deregisterFromLivestream(livestream.id, userData)
      recommendationServiceInstance.unRegisterEvent(
         livestream.id,
         userData.authId
      )
      dataLayerLivestreamEvent("event_registration_removed", livestream)
   }, [firebase, livestream, userData])

   /**
    * Handle the register button click
    */
   const handleRegisterClick = useCallback(
      async (floating: boolean) => {
         // Check if the user is already registered
         try {
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

            const isAlreadyRegistered = livestreamPresenter.isUserRegistered(
               authenticatedUser.email || serverUserEmail
            )

            if (isAlreadyRegistered) {
               await deRegisterLivestream()
            } else {
               await initRegistrationProcess(floating)
            }
         } catch (e) {
            errorNotification(e)
         }
      },
      [
         asPath,
         authenticatedUser.email,
         authenticatedUser?.emailVerified,
         deRegisterLivestream,
         errorNotification,
         initRegistrationProcess,
         isLoggedOut,
         livestream,
         livestreamPresenter,
         push,
         serverUserEmail,
      ]
   )

   return handleRegisterClick
}

export default useLivestreamRegisterHandler
