import { userRepo } from "data/RepositoryInstances"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

const getKey = (userId: string) => {
   if (!userId) {
      return null
   }
   return `delete-${userId}-profile-avatar`
}

/**
 * Custom hook for deleting a user avatar image for the user identified by @param userId.
 * @param  userId - The ID of the user which the profile banner image will be deleted.
 * @returns An object containing the mutation function to delete a banner image for the user and its related SWR mutation state.
 */
export const useDeleteUserAvatarImage = (userId: string) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () => userRepo.updateUserData(userId, { avatar: null })

   return useSWRMutation(getKey(userId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to delete user avatar image", {
            key,
            userId,
         })
      },
   })
}
