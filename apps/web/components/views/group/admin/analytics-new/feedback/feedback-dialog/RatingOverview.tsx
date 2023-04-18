import Stack from "@mui/material/Stack"
import React, { FC } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Button } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import Link from "../../../../../common/Link"
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"
import RatingAnswers, { RatingAnswersSkeleton } from "./RatingAnswers"

const styles = sxStyles({
   goBackButton: {
      textTransform: "none",
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
}
export const RatingOverviewTitle: FC<FeedbackAnswersTitleProps> = ({
   livestreamStats,
   groupId,
}) => {
   return (
      <Stack direction="row" justifyContent="space-between" spacing={1}>
         <Button
            component={Link}
            color="grey"
            startIcon={<ArrowBackIosNewRoundedIcon />}
            href={`/group/${groupId}/admin/analytics/feedback/${livestreamStats.livestream.id}`}
            sx={styles.goBackButton}
         >
            Back to live stream’s feedback
         </Button>
      </Stack>
   )
}
