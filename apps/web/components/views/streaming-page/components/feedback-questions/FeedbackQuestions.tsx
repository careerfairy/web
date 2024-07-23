import { useFeedbackQuestions } from "components/views/group/admin/events/detail/form/views/questions/useFeedbackQuestions"
import { useCallback, useEffect, useState } from "react"

import { Slide, SlideProps, Snackbar, SnackbarContent } from "@mui/material"
import { EventRatingWithType } from "components/views/group/admin/events/detail/form/views/questions/commons"
import { livestreamService } from "data/firebase/LivestreamService"
import {
   useHasEnded,
   useHasStarted,
   useIsRecordingWindow,
   useStartedAt,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import DateUtil from "util/DateUtil"
import { useStreamingContext } from "../../context"
import { FeedbackQuestionCard } from "./FeedbackQuestionCard"

const styles = sxStyles({
   dialog: {
      display: "inline-flex",
      padding: 2,
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 1.5,
      width: "352px",
      borderRadius: "12px",
      background: "white",
      boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
      color: (theme) => theme.palette.neutral[900],
      "& .MuiSnackbarContent-message": {
         padding: 0,
         width: "100%",
      },
   },
})

type FeedbackQuestion = EventRatingWithType & { answered: boolean }

export const FeedbackQuestions = () => {
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
   const [open, setOpen] = useState<boolean>(false)
   const [minutesPassed, setMinutesPassed] = useState(
      hasStarted ? DateUtil.getMinutesPassed(new Date(startedAt)) : 0
   )
   /** The queue of questions that will show up to the user
    * Using a Map disregards duplicates, and the object indirection
    * avoids recreating a new Map at every set state */
   const [activeQuestions, setActiveQuestions] = useState<{
      questions: Map<FeedbackQuestion["id"], FeedbackQuestion>
   }>({ questions: new Map() })

   /** The local answers data to avoid too many fetch requests */
   const [feedbackQuestionsData, setFeedbackQuestionsData] =
      useState<FeedbackQuestion[]>(feedbackQuestions)

   const [firstActiveQuestion] = activeQuestions.questions.values()

   const getQuestionIndex = useCallback(
      (question: FeedbackQuestion) => {
         return feedbackQuestionsData.findIndex(
            (feedbackQuestion) => feedbackQuestion.id == question.id
         )
      },
      [feedbackQuestionsData]
   )

   const markAsAnswered = useCallback(
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
         if (activeQuestions.questions.size == 1) setOpen(false)
         setActiveQuestions((prev) => {
            prev.questions.delete(question.id)
            return { questions: prev.questions }
         })
         markAsAnswered(question)
      },
      [activeQuestions, markAsAnswered]
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
      [livestreamId, agoraUserId, minutesPassed, markAsAnswered, hasEnded]
   )

   const isAlreadyActive = useCallback(
      (question: FeedbackQuestion) => {
         return activeQuestions.questions.has(question.id)
      },
      [activeQuestions]
   )

   const checkFeedbackQuestions = useCallback(() => {
      feedbackQuestionsData.forEach(async (question: FeedbackQuestion) => {
         const shouldActivate = await questionShouldBeActive(question)
         if (shouldActivate && !isAlreadyActive(question)) {
            setActiveQuestions((prev) => {
               prev.questions.set(question.id, question)
               return { questions: prev.questions }
            })
            setOpen(true)
         }
      })
   }, [feedbackQuestionsData, isAlreadyActive, questionShouldBeActive])

   useEffect(() => {
      // listen for changes in questions mid live stream
      setFeedbackQuestionsData(feedbackQuestions)
      setActiveQuestions({ questions: new Map() })
   }, [feedbackQuestions])

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

   return (
      <Snackbar open={open} TransitionComponent={SlideTransition}>
         <SnackbarContent
            sx={styles.dialog}
            message={
               firstActiveQuestion ? (
                  <FeedbackQuestionCard
                     question={firstActiveQuestion}
                     questionNumber={getQuestionIndex(firstActiveQuestion) + 1}
                     onAnswer={handleAnswer}
                  />
               ) : null
            }
         />
      </Snackbar>
   )
}

function SlideTransition(props: SlideProps) {
   return <Slide {...props} direction="up" />
}
