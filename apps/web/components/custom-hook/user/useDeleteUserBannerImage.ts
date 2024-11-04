import { userRepo } from "data/RepositoryInstances"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

const getKey = (userId: string) => {
   if (!userId) {
      return null
   }
   return `delete-${userId}-profile-banner`
}

/**
 * Custom hook for deleting banner for a user, which is identified by @param userId.
 * @param  streamRef - The reference to the livestream.
 * @param  userId - The ID of the user which the profile banner image will be deleted.
 * @returns An object containing the mutation function to delete a banner image for the user and its related SWR mutation state.
 */
export const useDeleteUserBannerImage = (userId: string) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () =>
      userRepo.updateUserData(userId, { bannerImageUrl: null })

   return useSWRMutation(getKey(userId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to delete user banner image", {
            key,
            userId,
         })
      },
   })
}
