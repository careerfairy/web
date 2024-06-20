import { useFeedbackQuestions } from "components/views/group/admin/events/detail/form/views/questions/useFeedbackQuestions"
import { useCallback, useEffect, useState } from "react"

import { Slide, SlideProps, Snackbar, SnackbarContent } from "@mui/material"
import { EventRatingWithType } from "components/views/group/admin/events/detail/form/views/questions/commons"
import { livestreamService } from "data/firebase/LivestreamService"
import {
   useHasEnded,
   useHasStarted,
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
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { feedbackQuestions } = useFeedbackQuestions(
      livestreamId,
      "livestreams"
   )
   const startedAt = useStartedAt()
   const hasStarted = useHasStarted()
   const hasEnded = useHasEnded()
   const [open, setOpen] = useState<boolean>(false)
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
   >(
      // sort to get question number
      feedbackQuestions.sort((q1, q2) =>
         q1.appearAfter > q2.appearAfter ? 1 : -1
      ) as FeedbackQuestion[]
   )

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
         if (activeQuestions.length == 1) setOpen(false)
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
            setOpen(true)
         }
      })
   }, [feedbackQuestionsData, isAlreadyActive, questionShouldBeActive])

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
               activeQuestions[0] ? (
                  <FeedbackQuestionCard
                     question={activeQuestions[0]}
                     questionNumber={getQuestionIndex(activeQuestions[0]) + 1}
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
