import { LivestreamEvent, LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { useGroupLivestreams } from "./useGroupLivestreams"

export type TopCommunityQuestion = LivestreamQuestion & {
   livestreamTitle: string
   livestreamCompany: string
}

/**
 * Custom hook to fetch the top 5 community questions across all company live streams.
 * Orders by votes descending and returns the 5 most liked questions.
 * Results are memoized to avoid refetching on page refresh.
 * @param groupId - The unique identifier for the company group.
 */
export const useTopCommunityQuestions = (groupId: string | null) => {
   // Fetch all past livestreams for the company
   const { data: pastLivestreams = [], error: livestreamsError } = useGroupLivestreams(
      groupId || "",
      "past"
   )

   const fetchTopQuestions = async (): Promise<TopCommunityQuestion[]> => {
      if (!groupId || !pastLivestreams?.length) return []

      try {
         // Fetch questions from all past livestreams
         const allQuestionsPromises = pastLivestreams.map(async (livestream) => {
            const questions = await livestreamService.getQuestions(livestream.id)
            return questions.map((question) => ({
               ...question,
               livestreamTitle: livestream.title || "",
               livestreamCompany: livestream.company || "",
            }))
         })

         const allQuestionsArrays = await Promise.all(allQuestionsPromises)
         const allQuestions = allQuestionsArrays.flat()

         // Sort by votes descending and take top 5
         const topQuestions = allQuestions
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 5)

         return topQuestions
      } catch (error) {
         console.error("Error fetching top community questions:", error)
         throw error
      }
   }

   return useSWR<TopCommunityQuestion[]>(
      groupId && pastLivestreams?.length ? [`topCommunityQuestions`, groupId, pastLivestreams.length] : null,
      fetchTopQuestions,
      {
         ...reducedRemoteCallsOptions,
         // Memoize results for 5 minutes to avoid refetching on page refresh
         dedupingInterval: 5 * 60 * 1000,
         onError: (error) => {
            errorLogAndNotify(error, {
               title: "Error fetching top community questions",
               details: { groupId },
            })
         },
      }
   )
}