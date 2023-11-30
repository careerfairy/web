import { sparkService } from "data/firebase/SparksService"
import useSWRMutation from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Custom hook to manage the Sparks B2B onboarding completion status for a user.
 * @param {string} userId - The ID of the user.
 * @returns {UseSparksB2BOnboardingCompletion} The onboarding completion status and a function to mark it as completed.
 */
const useSparksB2BOnboardingCompletion = (userId: string) => {
   return useSWRMutation(
      `${userId}/sparksB2BOnboardingCompleted`,
      async () => sparkService.markSparksB2BOnboardingAsCompleted(userId),
      {
         onError: errorLogAndNotify,
      }
   )
}

export default useSparksB2BOnboardingCompletion
