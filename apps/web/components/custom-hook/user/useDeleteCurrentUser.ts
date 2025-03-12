import { userService } from "data/firebase/UserService"
import { useAuth } from "HOCs/AuthProvider"
import useSWRMutation from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

const deleteUserFetcher = async () => userService.deleteCurrentUser()

type UseDeleteCurrentUserOptions = {
   onFinish?: () => void
}

/**
 * Custom hook for handling current user deletion
 *
 * Takes an optional callback function to be called when the deletion mutation is finished regardless of success or failure
 */
export const useDeleteCurrentUser = (options?: UseDeleteCurrentUserOptions) => {
   const { authenticatedUser } = useAuth()

   return useSWRMutation(
      authenticatedUser ? ["deleteUser", authenticatedUser.uid] : null,
      deleteUserFetcher,
      {
         onSuccess: options?.onFinish,
         onError: (error) => {
            errorLogAndNotify(error, {
               message: "Failed to delete user",
            })
            options?.onFinish?.()
         },
      }
   )
}
