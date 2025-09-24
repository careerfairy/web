import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent, LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { UPCOMING_STREAM_THRESHOLD_MILLISECONDS } from "@careerfairy/shared-lib/livestreams/constants"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"

export interface TopCommunityQuestion extends LivestreamQuestion {
   livestreamTitle?: string
   livestreamCompany?: string
}

/**
 * Custom hook to fetch the top 5 most liked community questions from past and upcoming livestreams
 * organized by a specific group within the last 1 year. Results are memoized to avoid re-fetching on page refresh.
 *
 * @param groupId - The ID of the group to fetch questions for
 * @returns SWR response with the top 5 questions sorted by likes in descending order
 */
export const useTopCommunityQuestions = (groupId: string) => {
   const firestore = useFirestore()

   const fetchTopQuestions = async (): Promise<TopCommunityQuestion[]> => {
      // Return empty array if no groupId
      if (!groupId) {
         return []
      }

      try {
         // Calculate date 1 year ago
         const oneYearAgo = new Date()
         oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

         // Fetch all livestreams from the last 12 months and upcoming ones for this group
         // Using a single query that gets all streams from 1 year ago to future
         const livestreamsQuery = query(
            collection(firestore, "livestreams"),
            where("test", "==", false),
            where("groupIds", "array-contains", groupId),
            where("start", ">", oneYearAgo), // From last 1 year to future
            orderBy("start", "desc")
         ).withConverter(createGenericConverter<LivestreamEvent>())

         const livestreamsSnapshot = await getDocs(livestreamsQuery)
         const allLivestreams = livestreamsSnapshot.docs.map((doc) => doc.data())

         // Return empty array if no livestreams found
         if (!allLivestreams?.length) {
            return []
         }

         // Collect all questions from all livestreams (past and upcoming) with better error handling
         const allQuestionsPromises = allLivestreams.map(
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
      groupId ? `top-community-questions-${groupId}` : null,
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