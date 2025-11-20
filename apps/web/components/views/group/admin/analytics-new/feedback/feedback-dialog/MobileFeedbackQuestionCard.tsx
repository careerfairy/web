import { Box, ButtonBase, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../../../../types/commonTypes"
import {
   EventRatingWithType,
   FeedbackQuestionsLabels,
   FeedbackQuestionType,
} from "../../../events/detail/form/views/questions/commons"
import { useFeedbackDialogContext } from "./FeedbackDialog"
import { useFeedbackQuestionStats } from "./useFeedbackQuestionStats"

const styles = sxStyles({
   card: {
      p: 1,
      borderRadius: "10px",
      border: 1,
      borderColor: "neutral.200",
      backgroundColor: "white",
      width: 224,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-start",
      textAlign: "left",
      transition: "all 0.2s",
      gap: 2,
   },
   bottomRow: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(232, 232, 232, 0.40)",
      borderRadius: 2,
      px: 1,
      height: 36,
   },
   metricBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      height: "100%",
   },
   questionText: {
      ...getMaxLineStyles(2),
      lineHeight: "24px",
   },
})

type MobileFeedbackQuestionCardProps = {
   question: EventRatingWithType
}

export const MobileFeedbackQuestionCard = ({
   question,
}: MobileFeedbackQuestionCardProps) => {
   const { onFeedbackQuestionClick } = useFeedbackDialogContext()
   const {
      averageRating,
      numberOfAnswers,
      sentimentEmoji,
      sentimentPercentage,
   } = useFeedbackQuestionStats(question)

   const renderMetric = () => {
      if (question.type === FeedbackQuestionType.TEXT) {
         return null
      }

      if (question.type === FeedbackQuestionType.SENTIMENT_RATING) {
         return (
            <Box sx={styles.metricBox}>
               <Typography
                  fontSize={18}
                  lineHeight={1}
                  color="neutral.600"
                  sx={{ mb: 0.5 }} // adjust for emoji alignment
               >
                  {sentimentEmoji}
               </Typography>
               <Typography variant="small" color="neutral.700">
                  {sentimentPercentage !== null
                     ? `${sentimentPercentage}%`
                     : "0%"}
               </Typography>
            </Box>
         )
      }

      // Rating
      return (
         <Box sx={styles.metricBox}>
            <Typography
               variant="brandedH5"
               color="neutral.600"
               fontWeight={600}
               sx={{ lineHeight: 1 }}
            >
               {averageRating.toFixed(1)}
            </Typography>
         </Box>
      )
   }

   return (
      <ButtonBase
         sx={styles.card}
         onClick={() => onFeedbackQuestionClick(question)}
      >
         <Stack spacing={2} alignItems="flex-start" width="100%">
            <Typography
               variant="body1"
               color="neutral.700"
               sx={styles.questionText}
            >
               {question.question}
            </Typography>
            <Typography variant="small" color="neutral.600">
               {FeedbackQuestionsLabels[question.type]}
            </Typography>
         </Stack>

         <Box sx={styles.bottomRow}>
            <Typography variant="small" color="neutral.600">
               {numberOfAnswers} answers
            </Typography>
            {renderMetric()}
         </Box>
      </ButtonBase>
   )
}
