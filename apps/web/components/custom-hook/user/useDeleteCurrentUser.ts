import { userService } from "data/firebase/UserService"
import { useAuth } from "HOCs/AuthProvider"
import useSWRMutation from "swr/mutation"

const deleteUserFetcher = async () => userService.deleteCurrentUser()

type UseDeleteCurrentUserOptions = {
   onSuccess: () => void
}

/**
 * Custom hook for handling user deletion
 * Uses SWR mutation to prevent race conditions and handle loading/error states
 */
export const useDeleteCurrentUser = (options: UseDeleteCurrentUserOptions) => {
   const { authenticatedUser } = useAuth()

   return useSWRMutation(
      authenticatedUser ? ["deleteUser", authenticatedUser.uid] : null,
      deleteUserFetcher,
      {
         onSuccess: options.onSuccess,
      }
   )
}
