import { ReactNode, useEffect, useRef, useState } from "react"
import { useLatest } from "react-use"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import {
   groupRepo,
   livestreamRepo,
   userRepo,
} from "../../../../../data/RepositoryInstances"
import GroupsUtil from "../../../../../data/util/GroupsUtil"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { errorLogAndNotify } from "../../../../../util/CommonUtil"
// import removed: useGroupsByIds - we'll fetch groups for all selected livestreams
import { livestreamService } from "../../../../../data/firebase/LivestreamService"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { checkIfUserHasAnsweredAllLivestreamGroupQuestions } from "../../../common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import useRegistrationHandler from "../../useRegistrationHandler"
import RegisterDataConsentViewSkeleton from "./RegisterDataConsentViewSkeleton"

/**
 * Fetches the livestream groups consents, questions and user past answers
 *
 * If everything is answered, it will complete the registration and proceed to the next view
 * If not, it will render the children UI for the user to give consent/answer
 */
const GroupConsentDataFetching = ({ children }: { children: ReactNode }) => {
   const {
      livestream,
      registrationState,
      registrationDispatch,
      goToView,
      onRegisterSuccess,
   } = useLiveStreamDialog()

   const { authenticatedUser, userData, userStats } = useAuth()
   const { checkIfUserAgreedToGroupPolicy } = useFirebaseService()
   const { errorNotification } = useSnackbarNotifications()
   const {
      completeRegistrationProcess,
      registrationStatus,
      selectedLivestreams,
   } = useRegistrationHandler()

   const [isRegistering, setIsRegistering] = useState(false)
   const [hasRegistered, setHasRegistered] = useState(false)

   const isRegisteringRef = useLatest(isRegistering)

   const livestreamRef = useRef(livestream)

   useEffect(() => {
      livestreamRef.current = livestream
   }, [completeRegistrationProcess, livestream])

   // check if user has answered all questions / given consent
   useEffect(() => {
      const fetchAndValidate = async () => {
         // Determine which livestreams are part of the registration action
         const targetLivestreamIds = selectedLivestreams?.length
            ? selectedLivestreams.map((e) => e.id)
            : [livestreamRef.current?.id]

         // Fetch all target livestreams to build the union of participating groups
         const targetLivestreams = await Promise.all(
            targetLivestreamIds.map((id) => livestreamService.getById(id))
         )

         const allGroupIds = Array.from(
            targetLivestreams.flatMap((ls) => ls?.groupIds || [])
         )

         // Load all groups involved across the selected livestreams
         const groups = await groupRepo.getGroupsByIds(allGroupIds)

         const [{ hasAgreedToAll, groupsWithPolicies }, answers] =
            await Promise.all([
               GroupsUtil.getPolicyStatus(
                  groups,
                  authenticatedUser.email,
                  checkIfUserAgreedToGroupPolicy
               ),
               // Pre-load the user's existing answers for the CURRENT livestream only
               // (questions are per event; consent can be aggregated across events)
               groupRepo.mapUserAnswersToLivestreamGroupQuestions(
                  userData,
                  livestreamRef.current
               ),
            ])

         registrationDispatch({
            type: "set-user-existing-answers",
            payload: answers,
         })

         registrationDispatch({
            type: "set-groups-with-policies",
            payload: { groupsWithPolicies, hasAgreedToAll },
         })

         const hasAnsweredAllQuestions =
            checkIfUserHasAnsweredAllLivestreamGroupQuestions(answers)

         const shouldSkipConsentView =
            hasAgreedToAll &&
            hasAnsweredAllQuestions &&
            registrationState.shouldBypassMultiSelection

         if (shouldSkipConsentView) {
            switch (registrationStatus()) {
               case "can_register":
                  // we have enough information to complete the registration
                  if (isRegisteringRef.current) {
                     return
                  }
                  setIsRegistering(true)
                  completeRegistrationProcess(
                     userData,
                     authenticatedUser,
                     livestreamRef.current,
                     groupsWithPolicies,
                     answers
                  )
                     .then(() => {
                        setHasRegistered(true)
                        if (onRegisterSuccess) {
                           onRegisterSuccess()
                        }
                        goToView("register-ask-questions")
                     })
                     .catch((e) => {
                        errorNotification(e)
                     })
                     .finally(() => {
                        setIsRegistering(false)
                     })

                  break
               case "registered":
                  // user is already registered, so we can skip the registration process

                  registrationDispatch({
                     type: "set-loading-finished",
                  })

                  if (onRegisterSuccess) {
                     onRegisterSuccess()
                  }
                  goToView("register-ask-questions")
                  break

               default:
                  break
            }
         } else {
            registrationDispatch({
               type: "set-loading-finished",
            })
         }
      }

      fetchAndValidate().catch((e) => {
         errorNotification(e)
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      authenticatedUser,
      authenticatedUser.email,
      checkIfUserAgreedToGroupPolicy,
      errorNotification,
      registrationDispatch,
      userData,
      registrationStatus,
      hasRegistered,
      selectedLivestreams,
      onRegisterSuccess,
   ])

   // mark user as registered to any livestream
   // TODO: replace this with a livestreamRegistrations counter field on the userStats
   useEffect(() => {
      if (userData?.authId && !userStats?.hasRegisteredOnAnyLivestream) {
         // eslint-disable-next-line no-extra-semi
         ;(async () => {
            try {
               const isUserRegisterOnAnyLivestream =
                  await livestreamRepo.isUserRegisterOnAnyLivestream(
                     userData.authId
                  )
               await userRepo.updateUserHasRegisteredToAnyLivestreamEver(
                  userData.userEmail,
                  isUserRegisterOnAnyLivestream
               )
            } catch (error) {
               errorLogAndNotify(error, {
                  message: `Not able to very if ${userData.userEmail} has registered to any Livestream`,
               })
            }
         })()
      }
   }, [
      userData?.authId,
      userData?.userEmail,
      userStats?.hasRegisteredOnAnyLivestream,
   ])

   if (registrationState.isLoadingRequiredData) {
      // wait while we check for the user existing consent information
      // and past answers
      return <RegisterDataConsentViewSkeleton />
   }

   return <>{children}</>
}

export default GroupConsentDataFetching
