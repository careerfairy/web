import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useRouter } from "next/router"
import { useCallback } from "react"
import useSWRMutation from "swr/mutation"
import { useAuth } from "../../../HOCs/AuthProvider"
import { customJobRepo } from "../../../data/RepositoryInstances"
import { customJobServiceInstance } from "../../../data/firebase/CustomJobService"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import useSnackbarNotifications from "../useSnackbarNotifications"
import useCustomJob from "./useCustomJob"
import useUserJobApplication from "./useUserJobApplication"

const useCustomJobApply = (job: PublicCustomJob, livestreamId: string) => {
   const { userData } = useAuth()
   const { alreadyApplied } = useUserJobApplication(userData?.id, job.id)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { push, asPath } = useRouter()
   const customJob = useCustomJob(job.id)

   const { trigger: handleApply, isMutating: isApplying } = useSWRMutation(
      `user-${userData?.id}-applyToCustomJob-${job.id}`,
      () =>
         customJobServiceInstance.confirmJobApplication(
            livestreamId,
            job.id,
            userData?.id
         ),
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

            dataLayerEvent("livestream_custom_job_application_complete", {
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
         `user-${userData?.id}-clicksOnCustomJob-${job.id}`,
         async () => {
            return await Promise.all([
               customJobRepo.incrementCustomJobClicks(job.id),
               customJobRepo.applyUserToCustomJob(
                  userData,
                  customJob,
                  livestreamId
               ),
            ])
         }
      )

   return {
      alreadyApplied,
      handleApply,
      isApplying,
      handleClickApplyBtn,
      isClickingOnApplyBtn,
      redirectToSignUp,
   }
}

export default useCustomJobApply
