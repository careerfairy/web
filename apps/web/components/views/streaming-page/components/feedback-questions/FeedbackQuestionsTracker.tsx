import { useFeedbackQuestions } from "components/views/group/admin/events/detail/form/views/questions/useFeedbackQuestions"
import { useCallback, useEffect, useState } from "react"

import { EventRatingWithType } from "components/views/group/admin/events/detail/form/views/questions/commons"
import { livestreamService } from "data/firebase/LivestreamService"
import {
   useHasEnded,
   useHasStarted,
   useIsRecordingWindow,
   useStartedAt,
} from "store/selectors/streamingAppSelectors"
import { errorLogAndNotify } from "util/CommonUtil"
import DateUtil from "util/DateUtil"
import { useStreamingContext } from "../../context"
import { FeedbackQuestionSnackbarCard } from "../snackbar-notifications/FeedbackQuestionSnackbarCard"
import {
   SnackbarNotificationType,
   useSnackbarNotifications,
} from "../snackbar-notifications/SnackbarNotificationsProvider"

export type FeedbackQuestion = EventRatingWithType & { answered: boolean }

export const FeedbackQuestionsTracker = () => {
   const { livestreamId } = useStreamingContext()
   const isRecordingWindow = useIsRecordingWindow()
   const { feedbackQuestions } = useFeedbackQuestions(
      livestreamId,
      "livestreams"
   )

   if (isRecordingWindow) return null

   const sortQuestions = (questions) =>
      questions.sort((q1, q2) => (q1.appearAfter > q2.appearAfter ? 1 : -1))

   return (
      <FeedbackQuestionsComponent
         feedbackQuestions={sortQuestions(feedbackQuestions)}
      />
   )
}

export const FeedbackQuestionsComponent = ({
   feedbackQuestions,
}: {
   feedbackQuestions: FeedbackQuestion[]
}) => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const startedAt = useStartedAt()
   const hasStarted = useHasStarted()
   const hasEnded = useHasEnded()
   const { queueNotification, removeNotification, clearNotifications } =
      useSnackbarNotifications()

   const [minutesPassed, setMinutesPassed] = useState(
      hasStarted ? DateUtil.getMinutesPassed(new Date(startedAt)) : 0
   )

   /** The local answers data to avoid too many fetch requests */
   const [feedbackQuestionsData, setFeedbackQuestionsData] =
      useState<FeedbackQuestion[]>(feedbackQuestions)

   const getQuestionIndex = useCallback(
      (question: FeedbackQuestion) => {
         return feedbackQuestionsData.findIndex(
            (feedbackQuestion) => feedbackQuestion.id == question.id
         )
      },
      [feedbackQuestionsData]
   )

   const saveAnswerData = useCallback(
      (question: FeedbackQuestion) => {
         const questionIndex = getQuestionIndex(question)
         const newQuestionsData = [...feedbackQuestionsData]
         newQuestionsData[questionIndex].answered = true
         setFeedbackQuestionsData(newQuestionsData)
      },
      [feedbackQuestionsData, getQuestionIndex]
   )

   const handleAnswer = useCallback(
      (question: FeedbackQuestion) => {
         removeNotification(question.id)
         saveAnswerData(question)
      },
      [removeNotification, saveAnswerData]
   )

   const questionShouldBeActive = useCallback(
      async (question: FeedbackQuestion) => {
         if (
            minutesPassed >= question.appearAfter ||
            (hasEnded && minutesPassed <= question.appearAfter)
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
                  saveAnswerData(question)

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
      [livestreamId, agoraUserId, minutesPassed, saveAnswerData, hasEnded]
   )

   const checkFeedbackQuestions = useCallback(() => {
      feedbackQuestionsData.forEach(async (question: FeedbackQuestion) => {
         const shouldActivate = await questionShouldBeActive(question)
         if (shouldActivate) {
            queueNotification({
               id: question.id,
               type: SnackbarNotificationType.FEEDBACK_QUESTION,
               notification: (
                  <FeedbackQuestionSnackbarCard
                     question={question}
                     questionNumber={getQuestionIndex(question) + 1}
                     onAnswer={handleAnswer}
                  />
               ),
            })
         }
      })
   }, [
      feedbackQuestionsData,
      questionShouldBeActive,
      handleAnswer,
      queueNotification,
      getQuestionIndex,
   ])

   useEffect(() => {
      // listen for changes in questions mid live stream
      setFeedbackQuestionsData(feedbackQuestions)
      clearNotifications()
   }, [feedbackQuestions, clearNotifications])

   useEffect(() => {
      if (hasStarted && startedAt) {
         const interval = setInterval(() => {
            setMinutesPassed(DateUtil.getMinutesPassed(new Date(startedAt)))
         }, 1000)

         return () => {
            return clearInterval(interval)
         }
      }
   }, [startedAt, hasStarted])

   useEffect(() => {
      if (minutesPassed || hasEnded) {
         checkFeedbackQuestions()
      }
   }, [minutesPassed, checkFeedbackQuestions, hasEnded])

   return null
}
