import { useRouter } from "next/router"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import { useCallback, useMemo, useState } from "react"
import {
   LivestreamEvent,
   LivestreamQuestion,
} from "@careerfairy/shared-lib/livestreams"
import { recommendationServiceInstance } from "../../../data/firebase/RecommendationService"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import FirebaseService from "../../../data/firebase/FirebaseService"

type UseLivestreamQuestionHandlers = {
   toggleUpvoteQuestion: (
      question: LivestreamQuestion,
      livestream: LivestreamEvent
   ) => ReturnType<FirebaseService["upvoteLivestreamQuestion"]>
   isUpvoting: boolean
   hasUpvotedQuestion: (question: LivestreamQuestion) => boolean
}

const useLivestreamQuestionHandlers = (): UseLivestreamQuestionHandlers => {
   const { push, asPath } = useRouter()
   const { authenticatedUser, userData, isLoggedOut } = useAuth()
   const [isUpvoting, setIsUpvoting] = useState(false)

   const { upvoteLivestreamQuestion } = useFirebaseService()

   const toggleUpvoteQuestion = useCallback(
      async (question: LivestreamQuestion, livestream: LivestreamEvent) => {
         if (isLoggedOut) {
            return void push({
               pathname: `/signup`,
               query: { absolutePath: asPath },
            })
         }
         try {
            setIsUpvoting(true)
            const status = await upvoteLivestreamQuestion(
               livestream.id,
               question,
               authenticatedUser.email
            )

            if (status === "upvoted") {
               recommendationServiceInstance.upvoteQuestion(
                  livestream,
                  userData
               )
            }

            return status
         } catch (e) {
            errorLogAndNotify(e, {
               message: "Error upvoting question",
               details: {
                  question,
                  livestream,
                  userData,
               },
            })
         } finally {
            setIsUpvoting(false)
         }
      },
      [
         isLoggedOut,
         push,
         asPath,
         upvoteLivestreamQuestion,
         authenticatedUser.email,
         userData,
      ]
   )

   const hasUpvotedQuestion = useCallback(
      (question: LivestreamQuestion) => {
         return question.emailOfVoters?.includes(authenticatedUser.email)
      },
      [authenticatedUser.email]
   )

   return useMemo(
      () => ({
         toggleUpvoteQuestion,
         isUpvoting,
         hasUpvotedQuestion,
      }),
      [hasUpvotedQuestion, isUpvoting, toggleUpvoteQuestion]
   )
}
export default useLivestreamQuestionHandlers
