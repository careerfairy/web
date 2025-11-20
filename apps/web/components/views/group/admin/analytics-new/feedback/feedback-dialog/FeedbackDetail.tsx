import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { EmptyItemsView } from "components/views/common/EmptyItemsView"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"
import { Users } from "react-feather"
import { useMeasure } from "react-use"
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
   const [ref, { height }] = useMeasure<HTMLDivElement>()

   const { data: voters = [], status: votersStatus } =
      useLivestreamRatingVoters(
         liveStreamStats.livestream.id,
         selectedFeedbackQuestion.id,
         selectedFeedbackQuestion.type === FeedbackQuestionType.TEXT
      )

   const { stats, average, total } = useMemo(() => {
      if (!voters) return { stats: {}, average: 0, total: 0 }

      const total = voters.length
      if (total === 0) return { stats: {}, average: 0, total: 0 }

      let sum = 0
      const counts: Record<number, number> = {}

      voters.forEach((v) => {
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

   const loading = votersStatus === "loading"

   return (
      <motion.div
         animate={{ height: height || "auto" }}
         style={{ overflow: "hidden" }}
         transition={{ duration: 0.2 }}
      >
         <div ref={ref}>
            {loading ? (
               <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
               </Box>
            ) : (
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
                                 variant={
                                    isMobile ? "medium" : "desktopBrandedH5"
                                 }
                                 color="neutral.800"
                                 fontWeight={600}
                              >
                                 {selectedFeedbackQuestion.question}
                              </Typography>
                           </Stack>

                           {!loading && total === 0 ? (
                              <EmptyItemsView
                                 title={
                                    selectedFeedbackQuestion.type ===
                                    FeedbackQuestionType.TEXT
                                       ? "No answers"
                                       : "No votes"
                                 }
                                 description={
                                    selectedFeedbackQuestion.type ===
                                    FeedbackQuestionType.TEXT
                                       ? "This question didn't receive any answers."
                                       : "This question didn't receive any votes."
                                 }
                                 icon={<Users size={40} />}
                              />
                           ) : (
                              <>
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
                                    <SentimentView
                                       stats={stats}
                                       total={total}
                                    />
                                 )}
                                 {selectedFeedbackQuestion.type ===
                                    FeedbackQuestionType.TEXT && (
                                    <WrittenView voters={voters} />
                                 )}
                              </>
                           )}
                        </Stack>
                     </motion.div>
                  </AnimatePresence>

                  <FeedbackQuestionList />
               </Stack>
            )}
         </div>
      </motion.div>
   )
}
