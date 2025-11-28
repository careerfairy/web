import { Box, ButtonBase, Typography } from "@mui/material"
import { ChevronRight } from "react-feather"
import { sxStyles } from "../../../../../../../types/commonTypes"
import {
   EventRatingWithType,
   FeedbackQuestionsLabels,
   FeedbackQuestionType,
} from "../../../events/detail/form/views/questions/commons"
import { useFeedbackDialogContext } from "./FeedbackDialog"
import { useFeedbackQuestionStats } from "./useFeedbackQuestionStats"

const styles = sxStyles({
   questionCard: {
      p: 2,
      borderRadius: 2,
      border: 1,
      borderColor: "neutral.200",
      backgroundColor: "white",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      textAlign: "left",
      transition: "all 0.2s",
      "&:hover": {
         backgroundColor: "neutral.50",
         borderColor: "neutral.300",
      },
   },
   sentimentBadge: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      p: 1,
      borderRadius: 2,
      backgroundColor: "rgba(232, 232, 232, 0.50)",
      minWidth: 65,
   },
   ratingBadge: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 65,
      height: 36,
      borderRadius: 2,
      backgroundColor: "rgba(232, 232, 232, 0.50)",
      fontWeight: 600,
      color: "neutral.600",
   },
   iconWrapper: {
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "neutral.700",
   },
})

type FeedbackQuestionCardProps = {
   question: EventRatingWithType
}

export const FeedbackQuestionCard = ({
   question,
}: FeedbackQuestionCardProps) => {
   const { onFeedbackQuestionClick } = useFeedbackDialogContext()
   const {
      averageRating,
      numberOfAnswers,
      sentimentEmoji,
      sentimentPercentage,
   } = useFeedbackQuestionStats(question)

   const renderMetric = () => {
      if (question.type === FeedbackQuestionType.TEXT) {
         // Just spacing to align with others or nothing
         return <Box sx={{ width: 65 }} />
      }

      if (question.type === FeedbackQuestionType.SENTIMENT_RATING) {
         return (
            <Box sx={styles.sentimentBadge}>
               <Typography fontSize={18} lineHeight={1}>
                  {sentimentEmoji}
               </Typography>
               <Typography variant="small" color="text.secondary">
                  {sentimentPercentage !== null
                     ? `${sentimentPercentage}%`
                     : "0%"}
               </Typography>
            </Box>
         )
      }

      // Rating
      return <Box sx={styles.ratingBadge}>{averageRating.toFixed(1)}</Box>
   }

   return (
      <ButtonBase
         sx={styles.questionCard}
         onClick={() => onFeedbackQuestionClick(question)}
      >
         <Typography
            variant="body1"
            color="text.secondary"
            sx={{ width: 331, flexShrink: 0 }}
         >
            {question.question}
         </Typography>
         <Typography
            variant="small"
            color="text.secondary"
            sx={{ width: 117, flexShrink: 0 }}
         >
            {FeedbackQuestionsLabels[question.type]}
         </Typography>
         <Typography
            variant="small"
            color="text.secondary"
            sx={{ width: 96, flexShrink: 0 }}
         >
            {numberOfAnswers} answers
         </Typography>

         {renderMetric()}
         <Box sx={styles.iconWrapper}>
            <ChevronRight size={20} />
         </Box>
      </ButtonBase>
   )
}
