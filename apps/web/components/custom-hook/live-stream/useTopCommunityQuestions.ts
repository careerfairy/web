import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"

import { useGroupLivestreams } from "./useGroupLivestreams"

export interface TopCommunityQuestion extends LivestreamQuestion {
   livestreamTitle?: string
   livestreamCompany?: string
}

/**
 * Custom hook to fetch the top 5 most liked community questions from all past livestreams
 * organized by a specific group. Results are memoized to avoid re-fetching on page refresh.
 *
 * @param groupId - The ID of the group to fetch questions for
 * @returns SWR response with the top 5 questions sorted by likes in descending order
 */
export const useTopCommunityQuestions = (groupId: string) => {
   const firestore = useFirestore()

   // Fetch past livestreams for this group
   const {
      data: pastLivestreams,
      isLoading: isLoadingStreams,
      error: livestreamsError,
   } = useGroupLivestreams(groupId, "past")

   const fetchTopQuestions = async (): Promise<TopCommunityQuestion[]> => {
      // Return empty array if no groupId, still loading, or error occurred
      if (
         !groupId ||
         isLoadingStreams ||
         livestreamsError ||
         !pastLivestreams?.length
      ) {
         return []
      }

      try {
         // Collect all questions from all past livestreams with better error handling
         const allQuestionsPromises = pastLivestreams.map(
            async (livestream) => {
               try {
                  // Ensure livestream has valid id
                  if (!livestream?.id) return []

                  const questionsQuery = query(
                     collection(
                        firestore,
                        "livestreams",
                        livestream.id,
                        "questions"
                     ),
                     orderBy("votes", "desc"),
                     limit(10) // Get top 10 from each stream to ensure we have enough data
                  ).withConverter(createGenericConverter<LivestreamQuestion>())

                  const questionsSnapshot = await getDocs(questionsQuery)

                  return questionsSnapshot.docs.map((doc) => ({
                     ...doc.data(),
                     livestreamTitle: livestream.title || "Unknown Event",
                     livestreamCompany: livestream.company || "Unknown Company",
                  }))
               } catch (streamError) {
                  // Log error but don't fail the entire operation
                  console.warn(
                     `Failed to fetch questions for livestream ${livestream?.id}:`,
                     streamError
                  )
                  return []
               }
            }
         )

         const allQuestionsArrays = await Promise.all(allQuestionsPromises)
         const allQuestions = allQuestionsArrays.flat()

         // Sort all questions by votes in descending order and take top 5
         const topQuestions = allQuestions
            .filter(
               (question) => question && typeof question.votes === "number"
            ) // Ensure valid questions
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 5)

         return topQuestions
      } catch (error) {
         console.warn("Error fetching top community questions:", error)
         return []
      }
   }

   return useSWR<TopCommunityQuestion[]>(
      groupId && !isLoadingStreams && !livestreamsError
         ? `top-community-questions-${groupId}`
         : null,
      fetchTopQuestions,
      {
         ...reducedRemoteCallsOptions,
         // Cache for 5 minutes to avoid unnecessary re-fetching
         dedupingInterval: 5 * 60 * 1000,
         onError: (error) => {
            console.warn("SWR error in useTopCommunityQuestions:", error)
         },
      }
   )
}
