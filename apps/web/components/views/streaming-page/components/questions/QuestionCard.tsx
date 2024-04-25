import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Box, Stack, Typography } from "@mui/material"
import { useMarkQuestionAsDone } from "components/custom-hook/streaming/question"
import { useMarkQuestionAsCurrent } from "components/custom-hook/streaming/question/useMarkQuestionAsCurrent"
import BrandedOptions from "components/views/common/inputs/BrandedOptions"
import { Fragment, forwardRef } from "react"
import { CheckCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { CommentInput } from "./CommentInput"
import { CommentsList } from "./CommentsList"
import { useQuestionsVisibilityControls } from "./QuestionOptionsMenu"
import { useQuestionsListContext } from "./QuestionsLisProvider"
import { ToggleUpvoteButton } from "./ToggleUpvoteButton"

export const questionCardStyles = sxStyles({
   root: (theme) => ({
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      backgroundColor: theme.brand.white[100],
      borderRadius: "12px",
      transition: theme.transitions.create("border"),
      overflow: "hidden",
      position: "relative",
   }),
   greenBorder: {
      border: (theme) => `1px solid ${theme.palette.primary.main}`,
   },
   whiteBorder: {
      border: (theme) => `2px solid ${theme.brand.white[500]}`,
   },

   questionHeaderGreen: (theme) => ({
      color: theme.brand.white[100],
      backgroundColor: "primary.main",
   }),
   checkCircle: {
      width: 16,
      height: 16,
   },
   options: {
      position: "absolute",
      top: 11,
      right: 12,
   },
   whiteOptions: {
      "& svg": {
         color: (theme) => theme.brand.white[100],
      },
   },
})

type Props = {
   question: LivestreamQuestion
}

export const QuestionCard = forwardRef<HTMLDivElement, Props>(
   ({ question }, ref) => {
      const { onQuestionOptionsClick } = useQuestionsListContext()
      const { showOptions } = useQuestionsVisibilityControls(question)

      return (
         <Box
            sx={[
               questionCardStyles.root,
               question.type === "current" && questionCardStyles.greenBorder,
               question.type === "done" && questionCardStyles.whiteBorder,
            ]}
            ref={ref}
         >
            {(question.type === "current" || question.type === "done") && (
               <Header question={question} />
            )}
            <Content
               question={question}
               topPadding={question.type === "new" || question.type === "done"}
            />
            <Box
               component="span"
               sx={[
                  questionCardStyles.options,
                  question.type === "done" && questionCardStyles.whiteOptions,
               ]}
            >
               {Boolean(showOptions) && (
                  <BrandedOptions
                     onClick={(event) =>
                        onQuestionOptionsClick(event, question)
                     }
                  />
               )}
            </Box>
         </Box>
      )
   }
)

type StreamerActionsProps = {
   question: LivestreamQuestion
}

type AnswererHeaderProps = {
   question: LivestreamQuestion
}

const Header = ({ question }: AnswererHeaderProps) => {
   return (
      <Stack
         p={1.5}
         pb={question.type === "current" ? 0 : 1.5}
         sx={[
            question.type === "done" && questionCardStyles.questionHeaderGreen,
         ]}
         spacing={1.5}
      >
         {question.type === "current" && (
            <Typography variant="small" color="primary">
               Answering
            </Typography>
         )}
         {question.type === "done" && (
            <Stack spacing={1} alignItems="center" direction="row">
               <Typography variant="small">Answered</Typography>
               <Box
                  component={CheckCircle}
                  sx={questionCardStyles.checkCircle}
               />
            </Stack>
         )}
      </Stack>
   )
}

type ContentProps = {
   question: LivestreamQuestion
   topPadding: boolean
}

const Content = ({ question, topPadding }: ContentProps) => {
   const { setQuestionIdWithOpenedCommentList } = useQuestionsListContext()
   const { isHost } = useStreamingContext()

   return (
      <Stack spacing={3} p={1.5} pt={topPadding ? 1.5 : undefined}>
         <Typography variant="brandedBody" paddingRight={3} color="neutral.800">
            {question.title}
         </Typography>
         <Stack spacing={1}>
            <Stack spacing={3}>
               <span>
                  <ToggleUpvoteButton question={question} />
               </span>
               {Boolean(isHost) && (
                  <Stack id="comment-input-and-list" spacing={1}>
                     <Stack spacing={1.5}>
                        <StreamerActions question={question} />
                        <CommentInput
                           questionId={question.id}
                           onCommentPosted={() =>
                              setQuestionIdWithOpenedCommentList(question.id)
                           }
                        />
                     </Stack>
                  </Stack>
               )}
            </Stack>
            <CommentsList question={question} />
         </Stack>
      </Stack>
   )
}

const StreamerActions = ({ question }: StreamerActionsProps) => {
   const { streamerAuthToken, livestreamId } = useStreamingContext()
   const {
      trigger: markQuestionAsDone,
      isMutating: markQuestionAsDonePending,
   } = useMarkQuestionAsDone(livestreamId, question.id, streamerAuthToken)

   const {
      trigger: markQuestionAsCurrent,
      isMutating: markQuestionAsCurrentPending,
   } = useMarkQuestionAsCurrent(livestreamId, question.id, streamerAuthToken)

   return (
      <Fragment>
         {question.type === "new" && (
            <LoadingButton
               color="primary"
               variant="outlined"
               onClick={() => markQuestionAsCurrent()}
               loading={markQuestionAsCurrentPending}
            >
               Answer question
            </LoadingButton>
         )}
         {question.type === "current" && (
            <LoadingButton
               color="primary"
               variant="contained"
               onClick={() => markQuestionAsDone()}
               loading={markQuestionAsDonePending}
            >
               Mark as answered
            </LoadingButton>
         )}
      </Fragment>
   )
}

QuestionCard.displayName = "QuestionCard"
