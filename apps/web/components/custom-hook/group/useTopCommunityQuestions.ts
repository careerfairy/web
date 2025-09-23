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

         // Calculate the cutoff date for past streams (not upcoming)
         const pastStreamCutoff = new Date(
            Date.now() - UPCOMING_STREAM_THRESHOLD_MILLISECONDS
         )

         // Calculate date 1 year from now for upcoming streams
         const oneYearFromNow = new Date()
         oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

         // Fetch past livestreams from the last 1 year for this group
         const pastLivestreamsQuery = query(
            collection(firestore, "livestreams"),
            where("test", "==", false),
            where("groupIds", "array-contains", groupId),
            where("start", "<", pastStreamCutoff), // Only past streams
            where("start", ">", oneYearAgo), // Only from last 1 year
            orderBy("start", "desc")
         ).withConverter(createGenericConverter<LivestreamEvent>())

         // Fetch upcoming livestreams for this group (within the next year)
         const upcomingLivestreamsQuery = query(
            collection(firestore, "livestreams"),
            where("test", "==", false),
            where("groupIds", "array-contains", groupId),
            where("start", ">=", pastStreamCutoff), // Only upcoming streams
            where("start", "<", oneYearFromNow), // Within the next year
            orderBy("start", "asc")
         ).withConverter(createGenericConverter<LivestreamEvent>())

         // Execute both queries in parallel
         const [pastLivestreamsSnapshot, upcomingLivestreamsSnapshot] = await Promise.all([
            getDocs(pastLivestreamsQuery),
            getDocs(upcomingLivestreamsQuery)
         ])

         const pastLivestreams = pastLivestreamsSnapshot.docs.map((doc) => doc.data())
         const upcomingLivestreams = upcomingLivestreamsSnapshot.docs.map((doc) => doc.data())
         
         // Combine past and upcoming streams
         const allLivestreams = [...pastLivestreams, ...upcomingLivestreams]

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