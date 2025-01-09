import {
   LivestreamEvent,
   LivestreamQuestion,
} from "@careerfairy/shared-lib/livestreams"
import LivestreamService, {
   livestreamService,
} from "data/firebase/LivestreamService"
import { useRouter } from "next/router"
import { useCallback, useMemo, useState } from "react"
import { useAuth } from "../../../HOCs/AuthProvider"
import { recommendationServiceInstance } from "../../../data/firebase/RecommendationService"
import { errorLogAndNotify } from "../../../util/CommonUtil"

type UseLivestreamQuestionHandlers = {
   toggleUpvoteQuestion: (
      question: LivestreamQuestion,
      livestream: LivestreamEvent
   ) => ReturnType<LivestreamService["toggleUpvoteQuestion"]>
   isUpvoting: boolean
   hasUpvotedQuestion: (question: LivestreamQuestion) => boolean
}

const useLivestreamQuestionHandlers = (): UseLivestreamQuestionHandlers => {
   const { push, asPath } = useRouter()
   const { authenticatedUser, userData, isLoggedOut } = useAuth()
   const [isUpvoting, setIsUpvoting] = useState(false)

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
            const status = await livestreamService.toggleUpvoteQuestion(
               livestreamService.getLivestreamRef(livestream.id),
               question.id,
               authenticatedUser
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
      [isLoggedOut, push, asPath, authenticatedUser, userData]
   )

   const hasUpvotedQuestion = useCallback(
      (question: LivestreamQuestion) => {
         return (
            question.emailOfVoters?.includes(authenticatedUser.email) ||
            question.voterIds?.includes(authenticatedUser.uid)
         )
      },
      [authenticatedUser.email, authenticatedUser.uid]
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
