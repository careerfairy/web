import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import { Box, Button, Skeleton, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"

import {
   RatingWithLabel,
   RatingWithLabelSkeleton,
} from "../../../common/inputs"
import RatingAnswers, { RatingAnswersSkeleton } from "./RatingAnswers"
import useLivestreamRating from "./useLivestreamRating"

const styles = sxStyles({
   goBackButton: {
      textTransform: "none",
      py: 0.8,
      px: 1.5,
   },
   ratingWithLabel: {
      width: "150px",
   },
})

type FeedbackAnswersContentProps = {
   livestreamStats: LiveStreamStats
   feedbackQuestionId: string
}

export const RatingOverviewContent = ({
   livestreamStats,
   feedbackQuestionId,
}: FeedbackAnswersContentProps) => {
   if (!feedbackQuestionId) return null

   return (
      <Stack spacing={3}>
         <SuspenseWithBoundary fallback={<RatingAnswersSkeleton />}>
            <RatingAnswers
               livestreamStats={livestreamStats}
               feedbackQuestionId={feedbackQuestionId}
            />
         </SuspenseWithBoundary>
      </Stack>
   )
}

type FeedbackAnswersTitleProps = {
   livestreamStats: LiveStreamStats
   feedbackQuestionId: string
   onBackToFeedback?: () => void
}

export const RatingOverviewTitle = ({
   livestreamStats,
   feedbackQuestionId,
   onBackToFeedback,
}: FeedbackAnswersTitleProps) => {
   return (
      <Stack alignItems={"flex-start"} spacing={2}>
         <Button
            color="grey"
            startIcon={<ArrowBackIosNewRoundedIcon />}
            onClick={onBackToFeedback}
            sx={styles.goBackButton}
            size={"small"}
         >
            Back to live stream&apos;s feedback
         </Button>
         {feedbackQuestionId ? (
            <SuspenseWithBoundary fallback={<RatingTitleSkeleton />}>
               <RatingTitle
                  livestreamStats={livestreamStats}
                  feedbackQuestionId={feedbackQuestionId}
               />
            </SuspenseWithBoundary>
         ) : null}
      </Stack>
   )
}

type RatingTitleProps = {
   feedbackQuestionId: string
   livestreamStats: LiveStreamStats
}

const RatingTitle = ({
   livestreamStats,
   feedbackQuestionId,
}: RatingTitleProps) => {
   const { data: feedbackQuestion } = useLivestreamRating(
      livestreamStats.livestream.id,
      feedbackQuestionId
   )

   const numberOfVoters =
      livestreamStats.ratings?.[feedbackQuestionId]?.numberOfRatings ?? 0
   const averageRating =
      livestreamStats.ratings?.[feedbackQuestionId]?.averageRating ?? 0

   return (
      <Stack spacing={2}>
         <Typography variant="h4" fontWeight={600}>
            {feedbackQuestion?.question}
         </Typography>
         <Box sx={styles.ratingWithLabel}>
            <RatingWithLabel
               average={averageRating}
               numberOfRatings={numberOfVoters}
               color="primary.main"
               size="large"
            />
         </Box>
      </Stack>
   )
}

const RatingTitleSkeleton = () => {
   return (
      <Stack width={"100%"} spacing={2}>
         <Typography variant="h4" width="100%" fontWeight={600}>
            <Skeleton width="calc(100% - 20px)" />
         </Typography>
         <Box sx={styles.ratingWithLabel}>
            <RatingWithLabelSkeleton size="large" />
         </Box>
      </Stack>
   )
}
