import {
   LivestreamQuestion,
   LivestreamQuestionComment,
} from "@careerfairy/shared-lib/livestreams"
import { Box, Collapse, Stack, Typography } from "@mui/material"
import {
   useLivestreamQuestionComments,
   useLivestreamQuestions,
} from "components/custom-hook/streaming/question"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import LinkifyText from "components/util/LinkifyText"
import { CollapseButton } from "components/views/streaming-page/components/Buttons/CollapseButton"
import { CommentCardSkeleton } from "components/views/streaming-page/components/questions/CommentCardSkeleton"
import { QuestionCardSkeleton } from "components/views/streaming-page/components/questions/QuestionCardSkeleton"
import {
   commentCardStyles,
   questionCardStyles,
} from "components/views/streaming-page/components/questions/QuestionCardStyles"
import { getUserTypeFromComment } from "components/views/streaming-page/components/questions/util"
import { UserDetails } from "components/views/streaming-page/components/UserDetails"
import { useEffect, useState } from "react"
import { ThumbsUp } from "react-feather"
import { useInView } from "react-intersection-observer"
import { TransitionGroup } from "react-transition-group"
import { useRecordingFormContext } from "../RecordingFormProvider"
import { BaseDetailView } from "./BaseDetailView"

const MIN_QUESTIONS_TO_SHOW = 10

type QuestionsViewProps = {
   onBack: () => void
}

export const QuestionsView = ({ onBack }: QuestionsViewProps) => {
   return (
      <BaseDetailView title="Questions" onBack={onBack}>
         <SuspenseWithBoundary
            fallback={
               <Stack spacing={2} p={1.5}>
                  <QuestionCardSkeleton />
                  <QuestionCardSkeleton />
                  <QuestionCardSkeleton />
               </Stack>
            }
         >
            <QuestionsContent />
         </SuspenseWithBoundary>
      </BaseDetailView>
   )
}

const QuestionsContent = () => {
   const { livestream } = useRecordingFormContext()
   const [questionsLimit, setQuestionsLimit] = useState(MIN_QUESTIONS_TO_SHOW)

   const [ref, inView] = useInView()

   const { data: allQuestions } = useLivestreamQuestions(livestream?.id || "", {
      type: "all",
      limit: questionsLimit,
   })

   useEffect(() => {
      if (inView) {
         setQuestionsLimit((prev) => prev + MIN_QUESTIONS_TO_SHOW)
      }
   }, [inView])

   if (!allQuestions || allQuestions.length === 0) {
      return (
         <Box p={1.5}>
            <Typography variant="medium" color="text.secondary">
               No questions available for this live stream.
            </Typography>
         </Box>
      )
   }

   return (
      <Stack spacing={1} component={TransitionGroup}>
         {allQuestions.map((question, index) => (
            <Collapse
               key={question.id}
               ref={index === allQuestions.length - 1 ? ref : null}
            >
               <ReadOnlyQuestionCard question={question} />
            </Collapse>
         ))}
      </Stack>
   )
}

type ReadOnlyQuestionCardProps = {
   question: LivestreamQuestion
}

const ReadOnlyQuestionCard = ({ question }: ReadOnlyQuestionCardProps) => {
   const { livestream } = useRecordingFormContext()

   return (
      <Box sx={questionCardStyles.root}>
         <Stack spacing={1.5} p={1.5} pt={1.5}>
            <Typography
               variant="brandedBody"
               sx={questionCardStyles.title}
               color="neutral.800"
            >
               {question.title}
            </Typography>
            <Stack spacing={1}>
               <ReadOnlyCommentsList
                  livestreamId={livestream.id}
                  question={question}
               />
               <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                     component={ThumbsUp}
                     sx={{
                        width: "15px",
                        height: "15px",
                        color: "primary.main",
                     }}
                  />
                  <Typography variant="small" color="primary.main">
                     {question.votes || 0} likes
                  </Typography>
               </Stack>
            </Stack>
         </Stack>
      </Box>
   )
}

type ReadOnlyCommentsListProps = {
   livestreamId: string
   question: LivestreamQuestion
}

const ReadOnlyCommentsList = ({
   livestreamId,
   question,
}: ReadOnlyCommentsListProps) => {
   const [isOpen, setIsOpen] = useState(false)
   const hasMoreComments = question.numberOfComments > 1

   const handleToggle = () => {
      setIsOpen((prev) => !prev)
   }

   if (!question.firstComment) return null

   return (
      <>
         <ReadOnlyCommentCard comment={question.firstComment} />
         <Collapse unmountOnExit in={isOpen}>
            <SuspenseWithBoundary
               fallback={
                  <Stack spacing={1}>
                     {Array.from(
                        {
                           length:
                              question.numberOfComments > 1
                                 ? question.numberOfComments - 1
                                 : 0,
                        },
                        (_, index) => (
                           <CommentCardSkeleton key={index} />
                        )
                     )}
                  </Stack>
               }
            >
               <CommentsListContent
                  livestreamId={livestreamId}
                  question={question}
               />
            </SuspenseWithBoundary>
         </Collapse>
         {Boolean(hasMoreComments) && (
            <CollapseButton
               open={isOpen}
               openText="Hide all replies"
               closeText="Show all replies"
               onClick={handleToggle}
               color="neutral.400"
            />
         )}
      </>
   )
}

type CommentsListContentProps = {
   livestreamId: string
   question: LivestreamQuestion
}

const CommentsListContent = ({
   livestreamId,
   question,
}: CommentsListContentProps) => {
   const { data: comments } = useLivestreamQuestionComments(
      livestreamId,
      question.id
   )

   return (
      <Stack spacing={1}>
         {comments
            .filter((comment) => comment.id !== question.firstComment.id)
            .map((comment) => (
               <Box key={comment.id}>
                  <ReadOnlyCommentCard comment={comment} />
               </Box>
            ))}
      </Stack>
   )
}

type ReadOnlyCommentCardProps = {
   comment: LivestreamQuestionComment
}

const ReadOnlyCommentCard = ({ comment }: ReadOnlyCommentCardProps) => {
   const userType = getUserTypeFromComment(comment)

   return (
      <Stack sx={commentCardStyles.root} spacing={1.25}>
         <Stack direction="row" justifyContent="space-between">
            <UserDetails userType={userType} displayName={comment.author} />
         </Stack>
         <Typography
            variant="small"
            sx={commentCardStyles.title}
            color="neutral.700"
         >
            <LinkifyText>{comment.title}</LinkifyText>
         </Typography>
      </Stack>
   )
}
