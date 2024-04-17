import {
   LivestreamQuestion,
   hasUpvotedLivestreamQuestion,
} from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography } from "@mui/material"
import { Fragment, forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { QuestionOptionsMenu } from "./QuestionOptionsMenu"
import { useStreamingContext } from "../../context"
import { ThumbsUp, CheckCircle } from "react-feather"
import { LoadingButton } from "@mui/lab"
import { useAuth } from "HOCs/AuthProvider"
import { CommentInput } from "./CommentInput"
import { CommentsList } from "./CommentsList"

const styles = sxStyles({
   root: (theme) => ({
      border: "1px solid",
      borderColor: theme.brand.white[500],
      backgroundColor: theme.brand.white[100],
      borderRadius: "12px",
      transition: theme.transitions.create("border-color"),
      overflow: "hidden",
      position: "relative",
   }),
   greenBorder: {
      borderColor: "primary.main",
   },
   voteButton: {
      p: 0,
      borderRadius: 2,
      fontSize: "16px",
      minWidth: "auto",
      minHeight: "auto",
      lineHeight: 1.5,
      "& .MuiButton-startIcon": {
         marginRight: 1.25,
         ml: 0,
      },
      "& svg": {
         width: "14.762px",
         height: "15px",
      },
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
   onClickDelete: (questionId: string) => void
   onClickReset: (questionId: string) => void
}

export const QuestionCard = forwardRef<HTMLDivElement, Props>(
   ({ question, onClickDelete, onClickReset }, ref) => {
      const { isHost, agoraUserId } = useStreamingContext()

      return (
         <Box
            sx={[
               styles.root,
               question.type === "current" && styles.greenBorder,
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
               <QuestionOptionsMenu
                  isHost={isHost}
                  agoraUid={agoraUserId}
                  question={question}
                  onClickDelete={onClickDelete}
                  onClickReset={onClickReset}
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
   const { authenticatedUser } = useAuth()
   const hasUpvoted = hasUpvotedLivestreamQuestion(question, authenticatedUser)

   return (
      <Stack spacing={3} p={1.5} pt={topPadding ? 1.5 : undefined}>
         <Typography variant="brandedBody" paddingRight={3} color="neutral.800">
            {question.title}
         </Typography>
         <Stack spacing={3}>
            <span>
               <LoadingButton
                  startIcon={<ThumbsUp />}
                  size="small"
                  variant="text"
                  color={hasUpvoted ? "primary" : "grey"}
                  sx={styles.voteButton}
               >
                  {question.votes || 0} likes
               </LoadingButton>
            </span>
            <Stack spacing={1.5}>
               <StreamerActions question={question} />
               <Stack spacing={1}>
                  <CommentInput />
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
