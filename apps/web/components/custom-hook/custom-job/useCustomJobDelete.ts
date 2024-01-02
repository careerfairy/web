import useSnackbarNotifications from "../useSnackbarNotifications"
import { customJobRepo } from "../../../data/RepositoryInstances"
import useSWRMutation from "swr/mutation"

const useCustomJobDelete = (jobId: string) => {
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { trigger: handleDelete, isMutating: isDeleting } = useSWRMutation(
      `deleteCustomJob-${jobId}`,
      () => customJobRepo.deleteCustomJob(jobId),
      {
         onError: (error) => {
            errorNotification(
               error,
               "Sorry! Something failed, maybe try again later"
            )
         },
         onSuccess: () => {
            successNotification(
               "You have successfully deleted the job!",
               "Congrats"
            )
         },
      }
   )

   return { handleDelete, isDeleting }
}

export default useCustomJobDelete
