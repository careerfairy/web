import { useState, useCallback, useEffect, useMemo } from "react"
import * as Sentry from "@sentry/nextjs"
import { userAlreadyAppliedForJob } from "@careerfairy/shared-lib/dist/users"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { atsServiceInstance } from "../../../data/firebase/ATSService"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import useUserATSRelations from "../useUserATSRelations"
import useSnackbarNotifications from "../useSnackbarNotifications"
import useIsMobile from "../useIsMobile"

type UseJobApply = {
   /**
    * A function to apply for a job.
    */
   applyJob: () => void
   /**
    * A boolean representing loading state.
    */
   isLoading: boolean
}

/**
 * A hook to handle applying to a job for a specific user.
 * @param userData - The user's data.
 * @param job - The job to apply to.
 * @param livestreamId - The livestream id.
 * @param isApplied - A boolean representing if the user has already applied to the job.
 * @param handleAlreadyApply - A callback function that handles if the user has already applied to a job.
 * @returns An object containing an applyJob function and a isLoading boolean.
 */
const useJobApply = (
   userData: UserData,
   job: Job,
   livestreamId: string,
   isApplied: boolean,
   handleAlreadyApply: (available: boolean) => void
): UseJobApply => {
   const atsRelations = useUserATSRelations(userData.id)
   const isMobile = useIsMobile()
   const [isLoading, setIsLoading] = useState(false)
   const { successNotification, errorNotification } = useSnackbarNotifications()

   // Confirm if user already applied to this job
   useEffect(() => {
      if (
         atsRelations &&
         userAlreadyAppliedForJob(atsRelations, job.id) &&
         !isApplied
      ) {
         handleAlreadyApply(true)
      }
   }, [isApplied, atsRelations, job.id, handleAlreadyApply])

   // Apply to the job
   const applyJob = useCallback(() => {
      setIsLoading(true)
      atsServiceInstance
         .applyToAJob(livestreamId, job.id)
         .then(() => {
            handleAlreadyApply(true)
            successNotification(
               "You have successfully applied to the job!",
               "Congrats"
            )
         })
         .catch((e) => {
            console.error(e)
            Sentry.captureException(e)
            errorNotification("Sorry! Something failed, maybe try again later")
         })
         .finally(() => {
            setIsLoading(false)
            dataLayerEvent("livestream_job_application_complete", {
               jobId: job?.id,
               jobName: job?.name,
            })
         })
   }, [
      livestreamId,
      job.id,
      job?.name,
      handleAlreadyApply,
      successNotification,
      errorNotification,
   ])

   return useMemo(() => ({ applyJob, isLoading }), [applyJob, isLoading])
}

export default useJobApply
