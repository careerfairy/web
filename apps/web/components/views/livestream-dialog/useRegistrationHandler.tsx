import { GroupWithPolicy } from "@careerfairy/shared-lib/src/groups"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
} from "@careerfairy/shared-lib/src/livestreams"
import { UserReminderType } from "@careerfairy/shared-lib/src/users"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import { recommendationServiceInstance } from "../../../data/firebase/RecommendationService"
import UserUtil from "../../../data/util/UserUtil"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useUserReminders } from "../../../HOCs/UserReminderProvider"
import { dataLayerLivestreamEvent } from "../../../util/analyticsUtils"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import useSnackbarNotifications from "../../custom-hook/useSnackbarNotifications"
import { useLiveStreamDialog } from "./LivestreamDialog"
import { sparkService } from "../../../data/firebase/SparksService"

/**
 * Logic for handling the register button click
 */
export default function useRegistrationHandler() {
   const {
      livestream,
      isRecommended,
      livestreamPresenter,
      serverUserEmail,
      goToView,
      currentSparkId,
   } = useLiveStreamDialog()
   const { push, asPath } = useRouter()
   const { forceShowReminder } = useUserReminders()
   const { authenticatedUser, isLoggedOut, userData } = useAuth()
   const { errorNotification } = useSnackbarNotifications()
   const {
      registerToLivestream,
      deregisterFromLivestream,
      sendRegistrationConfirmationEmail,
   } = useFirebaseService()

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
      await deregisterFromLivestream(livestream.id, userData)
      recommendationServiceInstance.unRegisterEvent(
         livestream.id,
         userData.authId
      )
      dataLayerLivestreamEvent("event_registration_removed", livestream)

      // after de-register from a livestream we want to update the user sparks notifications for this user
      await sparkService.createUserSparksFeedEventNotifications(
         userData.userEmail
      )
   }, [deregisterFromLivestream, livestream, userData])

   /**
    * Should be called when the auth object is loaded
    */
   const registrationStatus = useCallback(() => {
      if (isLoggedOut || !authenticatedUser?.emailVerified) {
         return "login_required"
      }

      const isAlreadyRegistered = livestreamPresenter.isUserRegistered(
         authenticatedUser?.email || serverUserEmail
      )

      if (isAlreadyRegistered) {
         return "registered"
      }

      return "can_register"
   }, [
      authenticatedUser?.email,
      authenticatedUser?.emailVerified,
      isLoggedOut,
      livestreamPresenter,
      serverUserEmail,
   ])

   const redirectToLogin = useCallback(() => {
      return push({
         pathname: `/login`,
         query: { absolutePath: asPath },
      })
   }, [asPath, push])

   /**
    * Handle the register button click
    */
   const handleRegisterClick = useCallback(
      async (floating: boolean) => {
         // Check if the user is already registered
         const status = registrationStatus()
         try {
            if (status === "login_required") {
               dataLayerLivestreamEvent(
                  "event_registration_started_login_required",
                  livestream
               )

               return redirectToLogin()
            }

            if (status === "registered") {
               await deRegisterLivestream()
            } else {
               await initRegistrationProcess(floating)
            }
         } catch (e) {
            errorNotification(e)
         }
      },
      [
         deRegisterLivestream,
         errorNotification,
         initRegistrationProcess,
         livestream,
         redirectToLogin,
         registrationStatus,
      ]
   )

   /**
    * Complete the registration process by answering the group questions and give consent
    */
   const completeRegistrationProcess = useCallback(
      async (
         userData,
         authenticatedUser,
         livestream: LivestreamEvent,
         groupsWithPolicies: GroupWithPolicy[],
         userAnsweredLivestreamGroupQuestions: LivestreamGroupQuestionsMap
      ) => {
         registerToLivestream(
            livestream.id,
            userData,
            groupsWithPolicies,
            userAnsweredLivestreamGroupQuestions,
            {
               isRecommended,
               ...(currentSparkId && { sparkId: currentSparkId }),
            }
         )
            .then(() => {
               // after registration, remove from this user's sparks notification the existing notification related to this event
               sparkService
                  .removeAndSyncUserSparkNotification({
                     userId: userData.userEmail,
                     groupId:
                        livestream.groupIds?.[0] || livestream.author?.groupId,
                  })
                  .catch((e) =>
                     errorLogAndNotify(e, {
                        message: "Failed to remove spark notification",
                        user: authenticatedUser,
                        livestream,
                     })
                  )
            })
            .then(() => {
               sendRegistrationConfirmationEmail(
                  authenticatedUser,
                  userData,
                  livestream
               ).catch((e) =>
                  errorLogAndNotify(e, {
                     message: "Failed to send confirmation email",
                     user: authenticatedUser,
                     livestream,
                  })
               )

               // Increase livestream popularity
               recommendationServiceInstance.registerEvent(livestream, userData)

               dataLayerLivestreamEvent(
                  "event_registration_complete",
                  livestream
               )
            })
            .catch((e) => {
               errorLogAndNotify(e, {
                  message: "Error registering to livestream",
                  user: authenticatedUser,
                  livestream,
               })
            })
      },
      [
         currentSparkId,
         isRecommended,
         registerToLivestream,
         sendRegistrationConfirmationEmail,
      ]
   )

   return {
      handleRegisterClick,
      registrationStatus,
      redirectToLogin,
      completeRegistrationProcess,
   }
}
