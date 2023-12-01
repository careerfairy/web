import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { sparkService } from "data/firebase/SparksService"
import useSWRMutation from "swr/mutation"

/**
 * Custom hook to manage the Sparks B2B onboarding completion status for a user.
 * @param {string} userId - The ID of the user.
 * @returns {UseSparksB2BOnboardingCompletion} The onboarding completion status and a function to mark it as completed.
 */
const useSparksB2BOnboardingCompletion = (userId: string) => {
   const { errorNotification } = useSnackbarNotifications()

   return useSWRMutation(
      `${userId}/sparksB2BOnboardingCompleted`,
      async () => sparkService.markSparksB2BOnboardingAsCompleted(userId),
      {
         onError: (error) =>
            errorNotification(
               error,
               "We're sorry, but we couldn't complete your onboarding process at this time. Our team has been notified and is working on a solution. Please try again later."
            ),
      }
   )
}

export default useSparksB2BOnboardingCompletion
