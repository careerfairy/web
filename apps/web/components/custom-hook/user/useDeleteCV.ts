import { useCallback, useMemo, useState } from "react"
import { useAuth } from "../../../HOCs/AuthProvider"
import { userRepo } from "../../../data/RepositoryInstances"
import useSnackbarNotifications from "../useSnackbarNotifications"
import useFirebaseDelete from "../utils/useFirebaseDelete"

type UseDeleteCV = {
    handleDeleteCV: () => Promise<void>
    isLoadingDelete: boolean
}

type UseDeleteCVOptions = {
   onSuccess?: () => void
}

/**
 * Hook that provides functionality to delete a user's CV to Firebase storage.
 * @returns An object containing delete related state and methods.
 */
const useDeleteCV = ({onSuccess}: UseDeleteCVOptions = {}) => {
   const { userData } = useAuth()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const [loading, setLoading] = useState(false)
   const [deleteFiles, isDeleting] = useFirebaseDelete();


   const handleDeleteCV = useCallback(
      async () => {
         try {
            setLoading(true)
            const url = userData?.userResume
            deleteFiles([url])

            await userRepo.deleteResume(userData?.userEmail)
            successNotification("Your CV was successfully deleted")
            onSuccess && onSuccess()
         } catch (error) {
            errorNotification(error)
         } finally {
            setLoading(false)
         }
      },
      [ deleteFiles, userData, errorNotification, successNotification, onSuccess]
   )

   

   const isLoadingDelete = loading || isDeleting

   return useMemo<UseDeleteCV>(
      () => ({
        handleDeleteCV,
        isLoadingDelete,
         
      }),
      [
         handleDeleteCV,
         isLoadingDelete,
      ]
   )
}

export default useDeleteCV
