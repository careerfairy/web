import { useFeedbackQuestions } from "components/views/group/admin/events/detail/form/views/questions/useFeedbackQuestions"
import { useCallback, useEffect, useState } from "react"

import { EventRatingWithType } from "components/views/group/admin/events/detail/form/views/questions/commons"
import { livestreamService } from "data/firebase/LivestreamService"
import {
   useHasEnded,
   useHasStarted,
   useStartedAt,
} from "store/selectors/streamingAppSelectors"
import { errorLogAndNotify } from "util/CommonUtil"
import DateUtil from "util/DateUtil"
import { useStreamingContext } from "../../context"
import { FeedbackQuestionCard } from "./FeedbackQuestionCard"

type FeedbackQuestion = EventRatingWithType & { answered: boolean }

export const FeedbackQuestions = () => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { feedbackQuestions } = useFeedbackQuestions(
      livestreamId,
      "livestreams"
   )
   const startedAt = useStartedAt()
   const hasStarted = useHasStarted()
   const hasEnded = useHasEnded()
   const [minutesPassed, setMinutesPassed] = useState(
      hasStarted ? DateUtil.getMinutesPassed(new Date(startedAt)) : 0
   )
   /** The queue of questions that will show up to the user */
   const [activeQuestions, setActiveQuestions] = useState<FeedbackQuestion[]>(
      []
   )
   /** The local answers data to avoid too many fetch requests */
   const [feedbackQuestionsData, setFeedbackQuestionsData] = useState<
      FeedbackQuestion[]
   >(feedbackQuestions as FeedbackQuestion[])

   const getQuestionIndex = useCallback(
      (question) => {
         return feedbackQuestionsData.findIndex(
            (feedbackQuestion) => feedbackQuestion.id == question.id
         )
      },
      [feedbackQuestionsData]
   )

   const markAsAnswered = useCallback(
      (question) => {
         const questionIndex = getQuestionIndex(question)
         const newQuestionsData = [...feedbackQuestionsData]
         newQuestionsData[questionIndex].answered = true
         setFeedbackQuestionsData(newQuestionsData)
      },
      [feedbackQuestionsData, getQuestionIndex]
   )

   const handleAnswer = useCallback(
      (question) => {
         const removeActiveQuestion = [...activeQuestions]
         removeActiveQuestion.shift()
         setActiveQuestions(removeActiveQuestion)
         markAsAnswered(question)
      },
      [activeQuestions, markAsAnswered]
   )

   const questionShouldBeActive = useCallback(
      async (question: FeedbackQuestion) => {
         if (
            minutesPassed >= question.appearAfter ||
            (question.isForEnd && hasEnded)
         ) {
            if (!question.answered) {
               // Check the database
               try {
                  const { hasAnswered } =
                     await livestreamService.getUserFeedbackQuestionAnswer(
                        livestreamId,
                        question.id,
                        agoraUserId
                     )

                  // Save answer data to avoid fetching it again
                  markAsAnswered(question)

                  return !hasAnswered
               } catch (error) {
                  errorLogAndNotify(error, {
                     livestreamId: livestreamId,
                     questionId: question.id,
                     agoraUserId: agoraUserId,
                  })
               }
            }
         }
         return false
      },
      [livestreamId, agoraUserId, minutesPassed, hasEnded, markAsAnswered]
   )

   const isAlreadyActive = useCallback(
      (question) => {
         return activeQuestions.some(
            (activeQuestion) => activeQuestion.id == question.id
         )
      },
      [activeQuestions]
   )

   const checkFeedbackQuestions = useCallback(() => {
      feedbackQuestionsData.forEach(async (question: FeedbackQuestion) => {
         const shouldActivate = await questionShouldBeActive(question)
         if (shouldActivate && !isAlreadyActive(question)) {
            setActiveQuestions((prev) => [...prev, { ...question }])
         }
      })
   }, [feedbackQuestionsData, isAlreadyActive, questionShouldBeActive])

   useEffect(() => {
      if (hasStarted && startedAt) {
         const interval = setInterval(() => {
            setMinutesPassed(DateUtil.getMinutesPassed(new Date(startedAt)))
         }, 1000)

         return () => {
            setMinutesPassed(null)
            return clearInterval(interval)
         }
      }
   }, [startedAt, hasStarted])

   useEffect(() => {
      if (minutesPassed) {
         checkFeedbackQuestions()
      }
   }, [minutesPassed, checkFeedbackQuestions])

   if (!activeQuestions?.length) return null

   return (
      <>
         <FeedbackQuestionCard
            question={activeQuestions[0]}
            questionNumber={getQuestionIndex(activeQuestions[0]) + 1}
            open={Boolean(activeQuestions.length)}
            onAnswer={handleAnswer}
         />
      </>
   )
}
