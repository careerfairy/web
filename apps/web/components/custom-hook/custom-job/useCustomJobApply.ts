import {
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { trackLevelsJobApplied } from "store/reducers/talentGuideReducer"
import useSWRMutation from "swr/mutation"
import { AnalyticsEvents } from "util/analyticsConstants"
import { useAuth } from "../../../HOCs/AuthProvider"
import { customJobRepo } from "../../../data/RepositoryInstances"
import { customJobServiceInstance } from "../../../data/firebase/CustomJobService"
import { dataLayerCustomJobEvent } from "../../../util/analyticsUtils"
import useGroupFields from "../group/useGroupFields"
import { useAppDispatch } from "../store"
import useFingerPrint from "../useFingerPrint"
import useSnackbarNotifications from "../useSnackbarNotifications"
import { useIsInTalentGuide } from "../utils/useIsInTalentGuide"
import useCustomJob from "./useCustomJob"
import useUserJobApplication from "./useUserJobApplication"

const useCustomJobApply = (
   job: PublicCustomJob,
   context: CustomJobApplicationSource
) => {
   const { userData } = useAuth()
   const { data: fingerPrintId } = useFingerPrint()
   const isInTalentGuide = useIsInTalentGuide()
   const dispatch = useAppDispatch()
   const { alreadyApplied, applicationInitiatedOnly } = useUserJobApplication(
      userData?.id,
      job.id
   )

   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { push, asPath } = useRouter()
   const customJob = useCustomJob(job.id)
   const { data: groupFields } = useGroupFields(customJob.groupId, [
      "universityName",
   ])

   const { trigger: handleConfirmApply, isMutating: isApplying } =
      useSWRMutation(
         `user-${userData?.id}-applyToCustomJob-${job.id}`,
         async () => {
            if (userData) {
               return await customJobServiceInstance.confirmJobApplication(
                  job.id,
                  userData?.id
               )
            } else {
               return await customJobServiceInstance.confirmAnonymousJobApplication(
                  job.id,
                  fingerPrintId
               )
            }
         },
         {
            onError: (error) => {
               errorNotification(
                  error,
                  "Sorry! Something failed, maybe try again later"
               )
            },
            onSuccess: () => {
               successNotification(
                  "You have successfully applied to the job!",
                  "Congrats"
               )

               dataLayerCustomJobEvent(
                  AnalyticsEvents.CustomJobApplicationComplete,
                  job,
                  {
                     companyName: groupFields?.universityName,
                  }
               )

               if (isInTalentGuide) {
                  dispatch(
                     trackLevelsJobApplied({
                        jobId: job.id,
                        jobName: job.title,
                     })
                  )
               }
            },
         }
      )

   const redirectToSignUp = useCallback(() => {
      return push({
         pathname: "/signup",
         query: { absolutePath: asPath },
      })
   }, [asPath, push])

   const { trigger: handleClickApplyBtn, isMutating: isClickingOnApplyBtn } =
      useSWRMutation(
         `user-${userData?.id}-clicksOnCustomJob-${job.id}`,
         async () => {
            const jobApplication = userData
               ? customJobRepo.applyUserToCustomJob(
                    userData,
                    customJob,
                    context
                 )
               : customJobRepo.applyAnonymousUserToCustomJob(
                    fingerPrintId,
                    customJob,
                    context
                 )

            return await Promise.all([
               customJobRepo.incrementCustomJobClicks(job.id),
               jobApplication,
            ]).then(() => {
               dataLayerCustomJobEvent(
                  AnalyticsEvents.CustomJobApplicationInitiated,
                  job,
                  {
                     companyName: groupFields?.universityName,
                  }
               )
            })
         }
      )

   return {
      alreadyApplied,
      handleConfirmApply,
      isApplying,
      handleClickApplyBtn,
      isClickingOnApplyBtn,
      redirectToSignUp,
      applicationInitiatedOnly,
   }
}

export default useCustomJobApply
