import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography } from "@mui/material"
import { Fragment, forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { CheckCircle } from "react-feather"
import { LoadingButton } from "@mui/lab"
import { CommentInput } from "./CommentInput"
import { CommentsList } from "./CommentsList"
import BrandedOptions from "components/views/common/inputs/BrandedOptions"
import { useQuestionsListContext } from "./QuestionsLisProvider"
import { ToggleUpvoteButton } from "./ToggleUpvoteButton"

const styles = sxStyles({
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
      return (
         <Box
            sx={[
               styles.root,
               question.type === "current" && styles.greenBorder,
               question.type === "done" && styles.whiteBorder,
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
                  styles.options,
                  question.type === "done" && styles.whiteOptions,
               ]}
            >
               <BrandedOptions
                  onClick={(event) => onQuestionOptionsClick(event, question)}
               />
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
         sx={[question.type === "done" && styles.questionHeaderGreen]}
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
               <Box component={CheckCircle} sx={styles.checkCircle} />
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
   return (
      <Stack spacing={3} p={1.5} pt={topPadding ? 1.5 : undefined}>
         <Typography variant="brandedBody" paddingRight={3} color="neutral.800">
            {question.title}
         </Typography>
         <Stack spacing={3}>
            <span>
               <ToggleUpvoteButton question={question} />
            </span>
            <Stack spacing={1.5}>
               <StreamerActions question={question} />
               <Stack spacing={1}>
                  <CommentInput questionId={question.id} />
                  <CommentsList question={question} />
               </Stack>
            </Stack>
         </Stack>
      </Stack>
   )
}

const StreamerActions = ({ question }: StreamerActionsProps) => {
   return (
      <Fragment>
         {question.type === "new" && (
            <LoadingButton color="primary" variant="outlined">
               Answer question
            </LoadingButton>
         )}
         {question.type === "current" && (
            <LoadingButton color="primary" variant="contained">
               Mark as answered
            </LoadingButton>
         )}
      </Fragment>
   )
}

QuestionCard.displayName = "QuestionCard"
