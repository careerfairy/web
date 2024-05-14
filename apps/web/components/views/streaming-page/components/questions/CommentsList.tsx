import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { Collapse, Slide, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamQuestionComments } from "components/custom-hook/streaming/question"
import { Fragment } from "react"
import { TransitionGroup } from "react-transition-group"
import { useStreamingContext } from "../../context"
import { CollapseButton } from "../Buttons/CollapseButton"
import { CommentCard } from "./CommentCard"
import { CommentCardSkeleton } from "./CommentCardSkeleton"
import { useQuestionsListContext } from "./QuestionsLisProvider"

type Props = {
   question: LivestreamQuestion
}

export const CommentsList = ({ question }: Props) => {
   const {
      onCommentOptionsClick,
      questionIdWithOpenedCommentList,
      setQuestionIdWithOpenedCommentList,
   } = useQuestionsListContext()

   const hasMoreComments = question.numberOfComments > 1
   const isOpen = questionIdWithOpenedCommentList === question.id

   const handleToggle = () => {
      if (isOpen) {
         setQuestionIdWithOpenedCommentList(null)
      } else {
         setQuestionIdWithOpenedCommentList(question.id)
      }
   }

   if (!question.firstComment) return null

   return (
      <Fragment>
         <CommentCard
            comment={question.firstComment}
            onOptionsClick={(event) =>
               onCommentOptionsClick(event, question.id, question.firstComment)
            }
         />
         <Collapse unmountOnExit in={isOpen}>
            <SuspenseWithBoundary
               fallback={
                  <ListSkeleton
                     numberOfComments={
                        question.numberOfComments > 1
                           ? question.numberOfComments - 1
                           : 0
                     }
                  />
               }
            >
               <List question={question} />
            </SuspenseWithBoundary>
         </Collapse>
         {Boolean(hasMoreComments) && (
            <CollapseButton
               open={isOpen}
               openText={"Hide all replies"}
               closeText={"Show all replies"}
               onClick={handleToggle}
               color="neutral.400"
            />
         )}
      </Fragment>
   )
}

type ListProps = {
   question: LivestreamQuestion
}

const List = ({ question }: ListProps) => {
   const { livestreamId } = useStreamingContext()
   const { data: comments } = useLivestreamQuestionComments(
      livestreamId,
      question.id
   )
   const { onCommentOptionsClick } = useQuestionsListContext()

   return (
      <TransitionGroup component={Stack} spacing={1}>
         {comments
            .filter((comment) => comment.id !== question.firstComment.id)
            .map((comment) => (
               <Slide key={comment.id} direction="left">
                  <CommentCard
                     comment={comment}
                     onOptionsClick={(event) =>
                        onCommentOptionsClick(event, question.id, comment)
                     }
                  />
               </Slide>
            ))}
      </TransitionGroup>
   )
}

type ListSkeletonProps = {
   numberOfComments: number
}

const ListSkeleton = ({ numberOfComments }: ListSkeletonProps) => {
   return (
      <Stack spacing={1}>
         {Array.from({ length: numberOfComments }, (_, index) => (
            <CommentCardSkeleton key={index} />
         ))}
      </Stack>
   )
}
