import { useCallback, useMemo, useState } from "react"
import useSnackbarNotifications from "../useSnackbarNotifications"
import { customJobRepo } from "../../../data/RepositoryInstances"

const useCustomJobDelete = (jobId: string) => {
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const [isDeleting, setIsDeleting] = useState(false)

   const handleDelete = useCallback(async () => {
      setIsDeleting(true)
      try {
         await customJobRepo.deleteCustomJob(jobId)

         successNotification(
            "You have successfully deleted the job!",
            "Congrats"
         )
      } catch (error) {
         errorNotification("Sorry! Something failed, maybe try again later")
      } finally {
         setIsDeleting(false)
      }
   }, [errorNotification, jobId, successNotification])

   return useMemo(
      () => ({ handleDelete, isDeleting }),
      [handleDelete, isDeleting]
   )
}

export default useCustomJobDelete
