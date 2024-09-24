import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { customJobServiceInstance } from "data/firebase/CustomJobService"
import useSWRMutation from "swr/mutation"
import { useAuth } from "../../../HOCs/AuthProvider"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import useSnackbarNotifications from "../useSnackbarNotifications"

const useRemoveUserCustomJob = (job: PublicCustomJob) => {
   const { userData } = useAuth()

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { trigger: handleConfirmRemove, isMutating: isRemoving } =
      useSWRMutation(
         `user-${userData?.id}-removeJobApplication-${job.id}_${userData?.id}`,
         async () => {
            if (userData) {
               return await customJobServiceInstance.removeUserJobApplication(
                  job.id,
                  userData?.id
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
               successNotification("You have removed the job!")

               dataLayerEvent("custom_job_application_removal_complete", {
                  jobId: job.id,
                  userId: userData?.id,
               })
            },
         }
      )

   return {
      handleConfirmRemove,
      isRemoving,
   }
}

export default useRemoveUserCustomJob
