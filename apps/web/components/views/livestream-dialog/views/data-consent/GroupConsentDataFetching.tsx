import { ReactNode, useEffect } from "react"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import {
   groupRepo,
   livestreamRepo,
   userRepo,
} from "../../../../../data/RepositoryInstances"
import GroupsUtil from "../../../../../data/util/GroupsUtil"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { errorLogAndNotify } from "../../../../../util/CommonUtil"
import useGroupsByIds from "../../../../custom-hook/useGroupsByIds"
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
   const { data: groups } = useGroupsByIds(livestream.groupIds)
   const { completeRegistrationProcess, registrationStatus } =
      useRegistrationHandler()

   // check if user has answered all questions / given consent
   useEffect(() => {
      const promises = []

      // parallel load
      promises.push(
         GroupsUtil.getPolicyStatus(
            groups,
            authenticatedUser.email,
            checkIfUserAgreedToGroupPolicy
         ),
         // pre-load the user's existing answers
         groupRepo.mapUserAnswersToLivestreamGroupQuestions(
            userData,
            livestream
         )
      )

      Promise.all(promises)
         .then(([{ hasAgreedToAll, groupsWithPolicies }, answers]) => {
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
            if (hasAgreedToAll && hasAnsweredAllQuestions) {
               switch (registrationStatus()) {
                  case "can_register":
                     // we have enough information to complete the registration
                     completeRegistrationProcess(
                        userData,
                        authenticatedUser,
                        livestream,
                        groupsWithPolicies,
                        answers
                     )
                        .then(() => {
                           onRegisterSuccess
                              ? onRegisterSuccess()
                              : goToView("register-ask-questions")
                        })
                        .catch((e) => {
                           errorNotification(e)
                        })

                     break
                  case "registered":
                     // user is already registered, so we can skip the registration process
                     onRegisterSuccess
                        ? onRegisterSuccess()
                        : goToView("register-ask-questions")
                     break

                  default:
                     break
               }
            } else {
               registrationDispatch({
                  type: "set-loading-finished",
               })
            }
         })
         .catch((e) => {
            errorNotification(e)
         })
   }, [
      authenticatedUser,
      authenticatedUser.email,
      checkIfUserAgreedToGroupPolicy,
      completeRegistrationProcess,
      errorNotification,
      goToView,
      groups,
      livestream,
      registrationDispatch,
      userData,
      registrationStatus,
   ])

   // mark user as registered to any livestream
   // TODO: replace this with a livestreamRegistrations counter field on the userStats
   useEffect(() => {
      if (userData?.authId && !userStats?.hasRegisteredOnAnyLivestream) {
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
