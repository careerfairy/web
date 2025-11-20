import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"
import { FeedbackQuestionType } from "../../../events/detail/form/views/questions/commons"
import { useFeedbackDialogContext } from "./FeedbackDialog"
import { FeedbackQuestionList } from "./FeedbackQuestionList"
import { RatingView } from "./RatingView"
import { SentimentView } from "./SentimentView"
import useLivestreamRatingVoters from "./useLivestreamRatingVoters"
import { WrittenView } from "./WrittenView"

export const FeedbackDetail = () => {
   const isMobile = useIsMobile()
   const { selectedFeedbackQuestion, liveStreamStats } =
      useFeedbackDialogContext()

   const { data: voters = [], status: votersStatus } =
      useLivestreamRatingVoters(
         liveStreamStats.livestream.id,
         selectedFeedbackQuestion.id,
         selectedFeedbackQuestion.type === FeedbackQuestionType.TEXT
      )
   const loading = votersStatus === "loading"

   const { stats, average, total } = useMemo(() => {
      if (!voters) return { stats: {}, average: 0, total: 0 }

      const total = voters.length
      if (total === 0) return { stats: {}, average: 0, total: 0 }

      let sum = 0
      const counts: Record<number, number> = {}

      voters.forEach((v) => {
         // For sentiment, rating is 1-3 usually in backend?
         // Wait, livestreams.ts: "assign a 1-5 rating based on the sentiment(1-3)" in normalizeRating
         // But raw data might be 1-3.
         // Let's check raw rating values. Assuming standard 1-5 for now based on usage.
         // If question.isSentimentRating, backend might store 1, 2, 3.
         // normalizeRating maps: 1->1, 2->3, 3->5.
         // BUT the new design has 5 emojis.
         // If the question type is the OLD sentiment (3 options), we map to 1, 3, 5.
         // If it's NEW sentiment, it might use 1-5.
         // For backward compatibility, we'll use the `rating` field directly if it exists.

         const val = v.rating || 0
         counts[val] = (counts[val] || 0) + 1
         sum += val
      })

      return {
         stats: counts,
         average: sum / total,
         total,
      }
   }, [voters])

   if (loading) {
      return (
         <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
         </Box>
      )
   }

   return (
      <Stack spacing={4}>
         <AnimatePresence mode="wait">
            <motion.div
               key={selectedFeedbackQuestion.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
            >
               <Stack spacing={2}>
                  <Stack spacing={1}>
                     <Typography
                        variant={isMobile ? "medium" : "desktopBrandedH5"}
                        color="neutral.800"
                        fontWeight={600}
                     >
                        {selectedFeedbackQuestion.question}
                     </Typography>
                  </Stack>

                  {selectedFeedbackQuestion.type ===
                     FeedbackQuestionType.STAR_RATING && (
                     <RatingView
                        stats={stats}
                        average={average}
                        total={total}
                     />
                  )}
                  {selectedFeedbackQuestion.type ===
                     FeedbackQuestionType.SENTIMENT_RATING && (
                     <SentimentView stats={stats} total={total} />
                  )}
                  {selectedFeedbackQuestion.type ===
                     FeedbackQuestionType.TEXT && (
                     <WrittenView voters={voters} />
                  )}
               </Stack>
            </motion.div>
         </AnimatePresence>

         <FeedbackQuestionList />
      </Stack>
   )
}
