import useUserJobApplication from "./useUserJobApplication"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import useSnackbarNotifications from "../useSnackbarNotifications"
import { useAuth } from "../../../HOCs/AuthProvider"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { customJobServiceInstance } from "../../../data/firebase/CustomJobService"
import { customJobRepo } from "../../../data/RepositoryInstances"
import useSWRMutation from "swr/mutation"
import { useCallback } from "react"
import { useRouter } from "next/router"

const useCustomJobApply = (job: PublicCustomJob, livestreamId: string) => {
   const { userData } = useAuth()
   const userCustomJob = useUserJobApplication(userData?.id, job.id)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { push, asPath } = useRouter()

   const alreadyApplied: boolean = !!userCustomJob

   const { trigger: handleApply, isMutating: isApplying } = useSWRMutation(
      `user-${userData?.id}-applyToCustomJob-${job.id}`,
      () =>
         customJobServiceInstance.applyToAJob(
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
      useSWRMutation(`user-${userData?.id}-clicksOnCustomJob-${job.id}`, () =>
         customJobRepo.incrementCustomJobClicks(job.id)
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
