import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

interface TopCommunityQuestion extends LivestreamQuestion {
   livestreamTitle?: string
   livestreamDate?: Date
}

/**
 * Custom hook to fetch the top 5 most liked questions from all livestreams 
 * organized by a company within the last year
 * @param groupId - The unique identifier for the group/company
 * @returns The top 5 questions with most likes, sorted by likes in descending order
 */
export const useTopCommunityQuestions = (groupId: string | null) => {
   return useSWR(
      groupId ? ["topCommunityQuestions", groupId] : null,
      async () => {
         if (!groupId) return []

         // Get all livestreams for the group from the last year
         const oneYearAgo = new Date()
         oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

         const livestreamsQuery = query(
            collection(FirestoreInstance, "livestreams"),
            where("groupId", "==", groupId),
            where("startTime", ">=", oneYearAgo)
         )

         const livestreamsSnapshot = await getDocs(livestreamsQuery)
         
         if (livestreamsSnapshot.empty) {
            return []
         }

         // Collect all questions from all livestreams
         const allQuestions: TopCommunityQuestion[] = []

         for (const livestreamDoc of livestreamsSnapshot.docs) {
            const livestreamData = livestreamDoc.data()
            
            const questionsQuery = query(
               collection(FirestoreInstance, "livestreams", livestreamDoc.id, "questions"),
               orderBy("votes", "desc")
            ).withConverter(createGenericConverter<LivestreamQuestion>())

            const questionsSnapshot = await getDocs(questionsQuery)
            
            questionsSnapshot.docs.forEach(questionDoc => {
               const questionData = questionDoc.data()
               if (questionData.votes > 0) { // Only include questions with likes
                  allQuestions.push({
                     ...questionData,
                     livestreamTitle: livestreamData.title,
                     livestreamDate: livestreamData.startTime?.toDate()
                  })
               }
            })
         }

         // Sort all questions by votes in descending order and take top 5
         return allQuestions
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 5)
      },
      {
         revalidateOnFocus: false,
         revalidateOnReconnect: false,
         revalidateIfStale: false,
         dedupingInterval: 300000, // 5 minutes
         onError: (err) => {
            errorLogAndNotify(err, {
               message: "Error in useTopCommunityQuestions",
               groupId,
            })
         },
      }
   )
}