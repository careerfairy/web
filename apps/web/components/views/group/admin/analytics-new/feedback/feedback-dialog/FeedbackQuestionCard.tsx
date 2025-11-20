import { Box, ButtonBase, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import useSWRCountQuery from "components/custom-hook/useSWRCountQuery"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query, where } from "firebase/firestore"
import { ChevronRight } from "react-feather"
import { sxStyles } from "../../../../../../../types/commonTypes"
import {
   EventRatingWithType,
   FeedbackQuestionsLabels,
   FeedbackQuestionType,
   SENTIMENT_EMOJIS,
} from "../../../events/detail/form/views/questions/commons"
import { useFeedbackDialogContext } from "./FeedbackDialog"

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
      px: 1,
      py: 0.5,
      borderRadius: 1,
      backgroundColor: "neutral.100",
   },
   ratingBadge: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 65,
      height: 36,
      borderRadius: 1,
      backgroundColor: "neutral.100",
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
   const { liveStreamStats, onFeedbackQuestionClick } =
      useFeedbackDialogContext()

   const averageRating =
      liveStreamStats?.ratings?.[question.id]?.averageRating ?? 0

   const votersCollection = collection(
      FirestoreInstance,
      "livestreams",
      liveStreamStats.livestream.id,
      "rating",
      question.id,
      "voters"
   )

   const votersQuery = query(
      votersCollection,
      ...(question.type === FeedbackQuestionType.TEXT
         ? [where("message", "!=", "")]
         : [])
   )

   const { count: fetchedCount } = useSWRCountQuery(votersQuery)

   const numberOfAnswers = fetchedCount ?? 0

   const renderMetric = () => {
      if (question.type === FeedbackQuestionType.TEXT) {
         // Just spacing to align with others or nothing
         return <Box sx={{ width: 65 }} />
      }

      if (question.type === FeedbackQuestionType.SENTIMENT_RATING) {
         // Map average rating to closest sentiment emoji
         const roundedRating = Math.round(averageRating)
         const clampedRating = Math.max(
            1,
            Math.min(5, roundedRating)
         ) as keyof typeof SENTIMENT_EMOJIS
         const emoji = SENTIMENT_EMOJIS[clampedRating]

         return (
            <Box sx={styles.sentimentBadge}>
               <Typography fontSize={18} lineHeight={1}>
                  {emoji}
               </Typography>
               <Typography variant="small" color="text.secondary">
                  {averageRating.toFixed(1)}
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
         <Stack direction="row" alignItems="center" spacing={2} flex={1}>
            <Typography variant="body1" color="text.secondary" sx={{ flex: 2 }}>
               {question.question}
            </Typography>
            <Typography variant="small" color="text.secondary" sx={{ flex: 1 }}>
               {FeedbackQuestionsLabels[question.type]}
            </Typography>
            <Typography
               variant="small"
               color="text.secondary"
               sx={{ flex: 0.5 }}
            >
               {numberOfAnswers} answers
            </Typography>
         </Stack>

         <Stack direction="row" alignItems="center" spacing={2}>
            {renderMetric()}
            <Box sx={styles.iconWrapper}>
               <ChevronRight size={20} />
            </Box>
         </Stack>
      </ButtonBase>
   )
}
