import { useCallback, useMemo, useState } from "react"
import useSnackbarNotifications from "../useSnackbarNotifications"
import useCustomJob from "./useCustomJob"
import { customJobRepo } from "../../../data/RepositoryInstances"

const useCustomJobDelete = (jobId: string) => {
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const job = useCustomJob(jobId)

   const alreadyDeleted: boolean = job?.deleted

   const [isDeleting, setIsDeleting] = useState(false)

   const handleDelete = useCallback(async () => {
      setIsDeleting(true)
      try {
         if (!alreadyDeleted) {
            await customJobRepo.deleteCustomJob(jobId)
         }

         successNotification(
            "You have successfully deleted the job!",
            "Congrats"
         )
      } catch (error) {
         errorNotification("Sorry! Something failed, maybe try again later")
      } finally {
         setIsDeleting(false)
      }
   }, [alreadyDeleted, errorNotification, jobId, successNotification])

   return useMemo(
      () => ({ alreadyDeleted, handleDelete, isDeleting }),
      [alreadyDeleted, handleDelete, isDeleting]
   )
}

export default useCustomJobDelete
