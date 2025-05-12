import { GroupWithPolicy } from "@careerfairy/shared-lib/src/groups"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
} from "@careerfairy/shared-lib/src/livestreams"
import { UserReminderType } from "@careerfairy/shared-lib/src/users"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { useAppDispatch } from "components/custom-hook/store"
import { useRefetchRegisteredStreams } from "components/custom-hook/useRegisteredStreams"
import { useIsInTalentGuide } from "components/custom-hook/utils/useIsInTalentGuide"
import { livestreamService } from "data/firebase/LivestreamService"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { trackLevelsLivestreamRegistrationCompleted } from "store/reducers/talentGuideReducer"
import { AnalyticsEvents } from "util/analyticsConstants"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useUserReminders } from "../../../HOCs/UserReminderProvider"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import { recommendationServiceInstance } from "../../../data/firebase/RecommendationService"
import { sparkService } from "../../../data/firebase/SparksService"
import UserUtil from "../../../data/util/UserUtil"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import { dataLayerLivestreamEvent } from "../../../util/analyticsUtils"
import useSnackbarNotifications from "../../custom-hook/useSnackbarNotifications"
import { useLiveStreamDialog } from "./LivestreamDialog"

/**
 * Logic for handling the register button click
 */
export default function useRegistrationHandler() {
   const { livestream, isRecommended, goToView, currentSparkId, mode } =
      useLiveStreamDialog()
   const { push, asPath, pathname } = useRouter()
   const { forceShowReminder } = useUserReminders()
   const { authenticatedUser, isLoggedOut, userData } = useAuth()
   const { errorNotification } = useSnackbarNotifications()
   const isInTalentGuidePage = useIsInTalentGuide()
   const dispatch = useAppDispatch()
   const firebase = useFirebaseService()
   const {
      registerToLivestream,
      deregisterFromLivestream,
      sendRegistrationConfirmationEmail,
   } = firebase

   const refetchRegisteredStreams = useRefetchRegisteredStreams()
   const isAlreadyRegistered = useUserIsRegistered(livestream.id)

   /**
    * Initiate the registration process
    */
   const initRegistrationProcess = useCallback(
      (floating: boolean) => {
         dataLayerLivestreamEvent(
            AnalyticsEvents.EventRegistrationStarted,
            livestream
         )

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
      refetchRegisteredStreams()
      recommendationServiceInstance.unRegisterEvent(
         livestream.id,
         userData.authId
      )

      dataLayerLivestreamEvent(
         AnalyticsEvents.EventRegistrationRemoved,
         livestream
      )

      // after de-register from a livestream we want to update the user sparks notifications for this user
      await sparkService
         .createUserSparksFeedEventNotifications(userData.userEmail)
         .catch(errorLogAndNotify)
   }, [
      deregisterFromLivestream,
      livestream,
      refetchRegisteredStreams,
      userData,
   ])

   /**
    * Should be called when the auth object is loaded
    */
   const registrationStatus = useCallback(() => {
      if (isLoggedOut || !authenticatedUser?.emailVerified) {
         return "login_required"
      }

      if (isAlreadyRegistered) {
         return "registered"
      }

      return "can_register"
   }, [authenticatedUser?.emailVerified, isLoggedOut, isAlreadyRegistered])

   const redirectToLogin = useCallback(() => {
      const url = new URL(asPath, window.location.origin)
      const isOnSparksFeed = pathname.includes("/sparks/[sparkId]")
      const utmParams = isOnSparksFeed
         ? { utm_source: "careerfairy", utm_medium: "sparks" }
         : null

      if (url.pathname.includes("job-details")) {
         url.pathname = url.pathname.split("job-details")[0]
      }

      if (mode === "page") {
         url.pathname += "/register"
      }

      return push({
         pathname: `/login`,
         query: { absolutePath: url.toString(), ...utmParams },
      })
   }, [asPath, pathname, push, mode])

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
                  AnalyticsEvents.EventRegistrationStartedLoginRequired,
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
         try {
            const hasAlreadyRegistered =
               await livestreamService.checkCategoryData(firebase, {
                  livestream,
                  userData,
               })

            if (!hasAlreadyRegistered) {
               await registerToLivestream(
                  livestream.id,
                  userData,
                  groupsWithPolicies,
                  userAnsweredLivestreamGroupQuestions,
                  {
                     isRecommended,
                     ...(currentSparkId && { sparkId: currentSparkId }),
                  }
               )

               // Do not await this call, it is not critical for the user experience
               sendRegistrationConfirmationEmail(
                  authenticatedUser,
                  userData,
                  livestream
               ).catch((e) => {
                  errorLogAndNotify(e, {
                     message: "Failed to send confirmation email",
                     user: authenticatedUser,
                     livestream,
                  })
               })

               // Increase livestream popularity
               recommendationServiceInstance.registerEvent(livestream, userData)

               dataLayerLivestreamEvent(
                  AnalyticsEvents.EventRegistrationComplete,
                  livestream
               )

               if (isInTalentGuidePage) {
                  dispatch(
                     trackLevelsLivestreamRegistrationCompleted({
                        livestreamId: livestream.id,
                        livestreamTitle: livestream.title,
                     })
                  )
               }
            }

            // after registration, remove from this user's sparks notification the existing notification related to this event
            // Not critical for user experience, so we don't await this
            sparkService
               .removeAndSyncUserSparkNotification({
                  userId: userData.userEmail,
                  groupId:
                     livestream.groupIds?.[0] || livestream.author?.groupId,
               })
               .catch((e) => {
                  errorLogAndNotify(e, {
                     message: "Failed to remove spark notification",
                     user: authenticatedUser,
                     livestream,
                  })
               })

            refetchRegisteredStreams()
         } catch (e) {
            errorLogAndNotify(e, {
               message: "Error registering to livestream",
               user: authenticatedUser,
               livestream,
            })
         }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
         currentSparkId,
         isRecommended,
         registerToLivestream,
         refetchRegisteredStreams,
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
