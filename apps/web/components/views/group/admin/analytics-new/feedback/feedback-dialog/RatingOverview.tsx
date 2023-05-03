import Stack from "@mui/material/Stack"
import React, { FC } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, Button, Skeleton, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import Link from "../../../../../common/Link"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"
import RatingAnswers, { RatingAnswersSkeleton } from "./RatingAnswers"
import useLivestreamRating from "./useLivestreamRating"
import {
   RatingWithLabel,
   RatingWithLabelSkeleton,
} from "../../../common/inputs"

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
   groupId: string
   feedbackQuestionId: string
}
export const RatingOverviewContent: FC<FeedbackAnswersContentProps> = ({
   livestreamStats,
   feedbackQuestionId,
}) => {
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
   groupId: string
   feedbackQuestionId: string
}
export const RatingOverviewTitle: FC<FeedbackAnswersTitleProps> = ({
   livestreamStats,
   groupId,
   feedbackQuestionId,
}) => {
   return (
      <Stack alignItems={"flex-start"} spacing={2}>
         <Button
            component={Link}
            color="grey"
            startIcon={<ArrowBackIosNewRoundedIcon />}
            href={`/group/${groupId}/admin/analytics/feedback/${livestreamStats.livestream.id}`}
            sx={styles.goBackButton}
            size={"small"}
         >
            Back to live stream’s feedback
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
const RatingTitle: FC<RatingTitleProps> = ({
   livestreamStats,
   feedbackQuestionId,
}) => {
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

const RatingTitleSkeleton: FC = () => {
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
