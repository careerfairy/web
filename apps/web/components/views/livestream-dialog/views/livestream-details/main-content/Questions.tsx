import { FC, useCallback, useMemo } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import {
   LivestreamEvent,
   LivestreamQuestion,
} from "@careerfairy/shared-lib/livestreams"
import Stack from "@mui/material/Stack"
import useInfiniteLivestreamQuestions from "../../../../../custom-hook/live-stream/useInfiniteLivestreamQuestions"
import { sxStyles } from "../../../../../../types/commonTypes"
import { Grid, Typography } from "@mui/material"
import ThumbUpIcon from "@mui/icons-material/ThumbUpOffAlt"
import useLivestreamQuestionHandlers from "../../../../../custom-hook/live-stream/useLivestreamQuestionHandlers"
import LoadingButton from "@mui/lab/LoadingButton"
import useCountQuery from "../../../../../custom-hook/useCountQuery"
import DateUtil from "../../../../../../util/DateUtil"
import { alpha } from "@mui/material/styles"
import Skeleton from "@mui/material/Skeleton"
import CustomInfiniteScroll from "../../../../common/CustomInfiniteScroll"
import { useAuth } from "../../../../../../HOCs/AuthProvider"

const styles = sxStyles({
   greyBorder: {
      borderColor: "#E1E1E1",
   },
   questionItem: {
      borderRadius: 2.5,
      border: "1px solid",
      p: [1.5, 1.625],
      bgcolor: "background.paper",
   },
   loader: {
      m: "auto",
   },
   questionsWrapper: {},
   scrollWrapper: {
      maxHeight: 400,
      overflowY: "auto",
   },
   btn: {
      textTransform: "none",
   },
   loadMoreButton: {
      fontSize: "1.071rem",
      fontWeight: 400,
      py: 1,
      bgcolor: "background.paper",
   },
   upvoteButton: {
      textTransform: "none",
      p: (theme) => `${theme.spacing(0.5)} ${theme.spacing(1)} !important`,
   },
   upvotedButton: {
      color: "primary.main",
   },
   nonUpvotedButton: {
      color: "action.disabled",
   },
   date: {
      fontSize: "0.857rem",
      color: (theme) => `${alpha(theme.palette.text.secondary, 0.4)}`,
      fontWeight: 400,
   },
})

interface Props {
   livestream: LivestreamEvent
}

const Questions: FC<Props> = ({ livestream }) => {
   return (
      <Box>
         <SectionTitle>Upcoming questions</SectionTitle>
         <QuestionsComponent livestream={livestream} />
      </Box>
   )
}

type QuestionsComponentProps = {
   userAddedQuestions?: LivestreamQuestion[]
   livestream: LivestreamEvent
   infiniteScroll?: boolean
   responsive?: boolean
}

export const QuestionsComponent: FC<QuestionsComponentProps> = ({
   livestream,
   userAddedQuestions,
   infiniteScroll = false,
   responsive,
}) => {
   const {
      loading,
      documents: questions,
      handleClientToggleUpvoteQuestion,
      hasMore,
      getAll,
      getMore,
      query: questionsQuery,
   } = useInfiniteLivestreamQuestions(livestream.id)

   const { count } = useCountQuery(questionsQuery)

   const gridItemProps = useMemo(() => {
      if (responsive) {
         return {
            xs: 12,
            sm: 6,
         }
      }
      return {
         xs: 12,
      }
   }, [responsive])

   const Content = useMemo(
      () => (
         <Box>
            <Grid sx={styles.questionsWrapper} container spacing={1.25}>
               {userAddedQuestions?.length ? (
                  <>
                     {userAddedQuestions.map((question) => (
                        <Grid key={question.id} item {...gridItemProps}>
                           <Question
                              livestream={livestream}
                              question={question}
                              handleClientToggleUpvoteQuestion={
                                 handleClientToggleUpvoteQuestion
                              }
                           />
                        </Grid>
                     ))}
                  </>
               ) : null}
               {questions
                  .filter(
                     (q) =>
                        !userAddedQuestions?.some(
                           (userQuestion) => userQuestion.id === q.id
                        )
                  )
                  .map((question) => (
                     <Grid key={question.id} item {...gridItemProps}>
                        <Question
                           livestream={livestream}
                           question={question}
                           handleClientToggleUpvoteQuestion={
                              handleClientToggleUpvoteQuestion
                           }
                        />
                     </Grid>
                  ))}

               {loading ? (
                  <>
                     <Grid item {...gridItemProps}>
                        <QuestionSkeleton />
                     </Grid>
                     <Grid item {...gridItemProps}>
                        <QuestionSkeleton />
                     </Grid>
                  </>
               ) : null}
               {!infiniteScroll && hasMore ? (
                  <Grid item xs={12}>
                     <LoadingButton
                        sx={[
                           styles.loadMoreButton,
                           styles.btn,
                           styles.greyBorder,
                        ]}
                        disabled={loading}
                        onClick={getAll}
                        fullWidth
                        variant="outlined"
                        color="grey"
                        size="small"
                     >
                        Load all {count ?? ""} questions
                     </LoadingButton>
                  </Grid>
               ) : null}
            </Grid>
         </Box>
      ),
      [
         count,
         getAll,
         gridItemProps,
         handleClientToggleUpvoteQuestion,
         hasMore,
         livestream,
         loading,
         userAddedQuestions,
         questions,
         infiniteScroll,
      ]
   )

   return infiniteScroll ? (
      <CustomInfiniteScroll hasMore={hasMore} loading={loading} next={getMore}>
         {Content}
      </CustomInfiniteScroll>
   ) : (
      Content
   )
}

type QuestionProps = {
   question: LivestreamQuestion
   livestream: LivestreamEvent
   handleClientToggleUpvoteQuestion: ReturnType<
      typeof useInfiniteLivestreamQuestions
   >["handleClientToggleUpvoteQuestion"]
}

const Question: FC<QuestionProps> = ({
   livestream,
   question,
   handleClientToggleUpvoteQuestion,
}) => {
   const { authenticatedUser } = useAuth()
   const { isUpvoting, hasUpvotedQuestion, toggleUpvoteQuestion } =
      useLivestreamQuestionHandlers()

   const handleClickUpvote = useCallback(
      async () =>
         toggleUpvoteQuestion(question, livestream).then((status) => {
            handleClientToggleUpvoteQuestion(question, status)
         }),
      [
         handleClientToggleUpvoteQuestion,
         livestream,
         question,
         toggleUpvoteQuestion,
      ]
   )
   const hasUpvoted = hasUpvotedQuestion(question)

   return (
      <Stack sx={[styles.questionItem, styles.greyBorder]} spacing={1}>
         <Typography>{question.title}</Typography>
         <Stack
            direction="row"
            alignItems="end"
            justifyContent="space-between"
            spacing={1}
         >
            <LoadingButton
               loading={isUpvoting}
               onClick={handleClickUpvote}
               disabled={question?.author === authenticatedUser?.email}
               size="small"
               startIcon={<ThumbUpIcon />}
               variant="text"
               color={hasUpvoted ? "primary" : "grey"}
               sx={[
                  hasUpvoted ? styles.upvotedButton : styles.nonUpvotedButton,
                  styles.upvoteButton,
                  styles.btn,
               ]}
            >
               {`${question.votes || 0} likes`}
            </LoadingButton>
            <Typography sx={styles.date}>
               {DateUtil.getTimeAgo(question.timestamp?.toDate() ?? new Date())}
            </Typography>
         </Stack>
      </Stack>
   )
}

const QuestionSkeleton: FC = () => {
   return (
      <Stack sx={[styles.questionItem, styles.greyBorder]} spacing={1}>
         <Typography>
            <Skeleton width={120} />
         </Typography>
         <Stack
            direction="row"
            alignItems="end"
            justifyContent="space-between"
            spacing={1}
         >
            <LoadingButton
               disabled
               size="small"
               startIcon={<ThumbUpIcon />}
               variant="text"
               sx={[styles.upvoteButton, styles.btn]}
            >
               <Skeleton width={40} />
            </LoadingButton>
            <Typography sx={styles.date}>
               <Skeleton width={80} />
            </Typography>
         </Stack>
      </Stack>
   )
}

export const QuestionsSkeleton: FC = () => {
   return (
      <Box>
         <SectionTitle>
            <Skeleton width={120} />
         </SectionTitle>
         <Stack sx={styles.questionsWrapper} spacing={1.25}>
            <QuestionSkeleton />
            <QuestionSkeleton />
            <QuestionSkeleton />
         </Stack>
      </Box>
   )
}

export default Questions
