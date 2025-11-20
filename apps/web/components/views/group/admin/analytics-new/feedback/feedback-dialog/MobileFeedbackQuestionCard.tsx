import { Box, ButtonBase, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import useSWRCountQuery from "components/custom-hook/useSWRCountQuery"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query } from "firebase/firestore"
import { sxStyles } from "../../../../../../../types/commonTypes"
import {
   EventRatingWithType,
   FeedbackQuestionsLabels,
   FeedbackQuestionType,
   SENTIMENT_EMOJIS,
} from "../../../events/detail/form/views/questions/commons"
import { useFeedbackDialogContext } from "./FeedbackDialog"

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
      backgroundColor: "neutral.100", // rgba(232, 232, 232, 0.4) -> neutral.100 is close
      borderRadius: 1,
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
})

type MobileFeedbackQuestionCardProps = {
   question: EventRatingWithType
}

export const MobileFeedbackQuestionCard = ({
   question,
}: MobileFeedbackQuestionCardProps) => {
   const { liveStreamStats, onFeedbackQuestionClick } =
      useFeedbackDialogContext()
   const statsCount =
      liveStreamStats?.ratings?.[question.id]?.numberOfRatings ?? 0
   const averageRating =
      liveStreamStats?.ratings?.[question.id]?.averageRating ?? 0

   const shouldFetchCount = true

   const votersQuery = query(
      collection(
         FirestoreInstance,
         "livestreams",
         liveStreamStats.livestream.id,
         "rating",
         question.id,
         "voters"
      )
   )

   const { count: fetchedCount } = useSWRCountQuery(votersQuery, {
      disabled: !shouldFetchCount,
   })

   const numberOfAnswers = shouldFetchCount ? fetchedCount ?? 0 : statsCount

   const renderMetric = () => {
      if (question.type === FeedbackQuestionType.TEXT) {
         return null
      }

      if (question.type === FeedbackQuestionType.SENTIMENT_RATING) {
         const roundedRating = Math.round(averageRating)
         const clampedRating = Math.max(
            1,
            Math.min(5, roundedRating)
         ) as keyof typeof SENTIMENT_EMOJIS
         const emoji = SENTIMENT_EMOJIS[clampedRating]

         return (
            <Box sx={styles.metricBox}>
               <Typography
                  fontSize={18}
                  lineHeight={1}
                  color="neutral.600"
                  sx={{ mb: 0.5 }} // adjust for emoji alignment
               >
                  {emoji}
               </Typography>
               {/* If we had percentage, we would use it here. For now, using average rating formatted similarly or just skip it if strictly matching Figma which has %, but code has 1-5.
                   Figma shows "71%". I'll show average rating for now to avoid lying.
                */}
               <Typography variant="small" color="neutral.700">
                  {averageRating.toFixed(1)}
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
         <Stack spacing={0.5} alignItems="flex-start" width="100%">
            <Typography
               variant="body1"
               color="neutral.700"
               sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: "24px",
               }}
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
