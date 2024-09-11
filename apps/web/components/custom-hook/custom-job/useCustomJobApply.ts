import {
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { useRouter } from "next/router"
import { useCallback } from "react"
import useSWRMutation from "swr/mutation"
import { useAuth } from "../../../HOCs/AuthProvider"
import { customJobRepo } from "../../../data/RepositoryInstances"
import { customJobServiceInstance } from "../../../data/firebase/CustomJobService"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import useFingerPrint from "../useFingerPrint"
import useSnackbarNotifications from "../useSnackbarNotifications"
import useCustomJob from "./useCustomJob"
import useUserJobApplication from "./useUserJobApplication"

const useCustomJobApply = (
   job: PublicCustomJob,
   context: CustomJobApplicationSource
) => {
   const { userData } = useAuth()
   const { data: fingerPrintId } = useFingerPrint()

   const { alreadyApplied, applicationInitiatedOnly } = useUserJobApplication(
      userData?.id,
      job?.id
   )

   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { push, asPath } = useRouter()
   const customJob = useCustomJob(job?.id)

   const { trigger: handleConfirmApply, isMutating: isApplying } =
      useSWRMutation(
         `user-${userData?.id}-applyToCustomJob-${job?.id}`,
         () => {
            if (userData) {
               customJobServiceInstance.confirmJobApplication(
                  job?.id,
                  userData?.id
               )
            } else {
               customJobServiceInstance.confirmAnonymousJobApplication(
                  job?.id,
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

               dataLayerEvent("custom_job_application_complete", {
                  jobId: job?.id,
                  jobName: job?.title,
               })
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
         `user-${userData?.id}-clicksOnCustomJob-${job?.id}`,
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
               customJobRepo.incrementCustomJobClicks(job?.id),
               jobApplication,
            ])
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
