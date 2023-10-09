import { useCallback, useEffect, useMemo, useState } from "react"
import useUserCustomJob from "./useUserCustomJob"
import { dataLayerEvent } from "../../util/analyticsUtils"
import useSnackbarNotifications from "./useSnackbarNotifications"
import { useAuth } from "../../HOCs/AuthProvider"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { customJobServiceInstance } from "../../data/firebase/CustomJobService"

const useCustomJobApply = (job: PublicCustomJob, livestreamId: string) => {
   const { userData } = useAuth()
   const [isApplying, setIsApplying] = useState(false)
   const [alreadyApplied, setAlreadyApplied] = useState(false)
   const userCustomJob = useUserCustomJob(userData.id, job.id)
   const { successNotification, errorNotification } = useSnackbarNotifications()

   useEffect(() => {
      if (userCustomJob) {
         setAlreadyApplied(true)
      }
   }, [userCustomJob])

   const handleApply = useCallback(async () => {
      setIsApplying(true)
      try {
         if (!alreadyApplied) {
            await customJobServiceInstance.applyToAJob(
               livestreamId,
               job.id,
               userData.id,
               job.groupId
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
      userData.id,
   ])

   return useMemo(
      () => ({ alreadyApplied, handleApply, isApplying }),
      [alreadyApplied, handleApply, isApplying]
   )
}

export default useCustomJobApply
