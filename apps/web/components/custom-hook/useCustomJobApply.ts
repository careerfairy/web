import { useCallback, useMemo, useState } from "react"
import useUserCustomJob from "./useUserCustomJob"
import { dataLayerEvent } from "../../util/analyticsUtils"
import useSnackbarNotifications from "./useSnackbarNotifications"
import { useAuth } from "../../HOCs/AuthProvider"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { customJobServiceInstance } from "../../data/firebase/CustomJobService"
import { customJobRepo } from "../../data/RepositoryInstances"

const useCustomJobApply = (job: PublicCustomJob, livestreamId: string) => {
   const { userData } = useAuth()
   const [isApplying, setIsApplying] = useState(false)
   const userCustomJob = useUserCustomJob(userData?.id, job.id)
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const alreadyApplied: boolean = !!userCustomJob

   const handleApply = useCallback(async () => {
      setIsApplying(true)
      try {
         if (!alreadyApplied) {
            await customJobServiceInstance.applyToAJob(
               livestreamId,
               job.id,
               userData?.id
            )
            successNotification(
               "You have successfully applied to the job!",
               "Congrats"
            )
         }
      } catch (error) {
         errorNotification("Sorry! Something failed, maybe try again later")
      } finally {
         setIsApplying(false)
         dataLayerEvent("livestream_custom_job_application_complete", {
            jobId: job?.id,
            jobName: job?.title,
         })
      }
   }, [
      alreadyApplied,
      errorNotification,
      job,
      livestreamId,
      successNotification,
      userData?.id,
   ])

   const handleClickApplyBtn = useCallback(async () => {
      setIsApplying(true)
      await customJobRepo.incrementCustomJobClicks(job.id, job.groupId)
      setIsApplying(false)
   }, [job.groupId, job.id])

   return useMemo(
      () => ({ alreadyApplied, handleApply, isApplying, handleClickApplyBtn }),
      [alreadyApplied, handleApply, handleClickApplyBtn, isApplying]
   )
}

export default useCustomJobApply
