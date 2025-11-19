import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   ratingBox: {
      p: 1,
      borderRadius: 1,
      border: 1,
      borderColor: "neutral.100",
      backgroundColor: "neutral.50",
      width: "100%",
   },
   averageBox: {
      p: 2,
      borderRadius: 1,
      backgroundColor: (theme) => `${theme.palette.neutral[200]}80`, // Using alpha
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: 150,
      flexShrink: 0,
   },
   chartRow: {
      display: "flex",
      alignItems: "center",
      gap: 2,
      width: "100%",
   },
   chartBarBg: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: "neutral.100",
      position: "relative",
      overflow: "hidden",
   },
   chartBarFill: () => ({
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%",
      borderRadius: 4,
      backgroundColor: "secondary.main",
   }),
})

const SENTIMENT_LABELS = {
   1: "Very unhappy",
   2: "Unhappy",
   3: "Neutral",
   4: "Happy",
   5: "Very happy",
}

const SENTIMENT_EMOJIS = {
   1: "😞",
   2: "☹️",
   3: "😐",
   4: "😊",
   5: "😁", // Design uses 😁 for 5
}

type SentimentViewProps = {
   stats: Record<number, number>
   total: number
}

export const SentimentView = ({ stats, total }: SentimentViewProps) => {
   // Find most voted
   let mostVotedVal = 0
   let maxVotes = -1
   Object.entries(stats).forEach(([val, count]) => {
      if (count > maxVotes) {
         maxVotes = count
         mostVotedVal = parseInt(val)
      }
   })

   const mostVotedEmoji =
      SENTIMENT_EMOJIS[mostVotedVal as keyof typeof SENTIMENT_EMOJIS] || "—"

   return (
      <Stack spacing={3}>
         <Box sx={styles.ratingBox}>
            <Stack direction="row" spacing={3} alignItems="center">
               <Box sx={styles.averageBox}>
                  <Typography variant="small" color="text.primary">
                     Most voted
                  </Typography>
                  <Typography fontSize="3rem" lineHeight={1.2}>
                     {mostVotedEmoji}
                  </Typography>
                  <Typography variant="xsmall" color="text.secondary" mt={1}>
                     {total} total answers
                  </Typography>
               </Box>
               <Stack flex={1} spacing={1.5}>
                  {[5, 4, 3, 2, 1].map((val) => {
                     const count = stats[val] || 0
                     const percentage = total > 0 ? (count / total) * 100 : 0
                     const emoji =
                        SENTIMENT_EMOJIS[val as keyof typeof SENTIMENT_EMOJIS]

                     // If old sentiment question (1-3), map appropriately?
                     // Assuming data is normalized or we just show what we have.
                     if (!emoji && count === 0) return null

                     return (
                        <Tooltip
                           key={val}
                           title={
                              SENTIMENT_LABELS[
                                 val as keyof typeof SENTIMENT_LABELS
                              ]
                           }
                           arrow
                           placement="left"
                        >
                           <Box sx={styles.chartRow}>
                              <Typography
                                 fontSize="1.5rem"
                                 sx={{ width: 30, textAlign: "center" }}
                              >
                                 {emoji}
                              </Typography>
                              <Typography
                                 variant="small"
                                 color="text.secondary"
                                 sx={{ minWidth: 100 }}
                              >
                                 {count} votes ({Math.round(percentage)}%)
                              </Typography>
                              <Box sx={styles.chartBarBg}>
                                 <Box
                                    sx={[
                                       styles.chartBarFill,
                                       { width: `${percentage}%` },
                                       // Use different colors per sentiment if desired, reusing rating colors
                                       val === 5
                                          ? { bgcolor: "secondary.main" }
                                          : val === 4
                                          ? { bgcolor: "secondary.light" }
                                          : val === 3
                                          ? { bgcolor: "neutral.300" }
                                          : { bgcolor: "neutral.200" },
                                    ]}
                                 />
                              </Box>
                           </Box>
                        </Tooltip>
                     )
                  })}
               </Stack>
            </Stack>
         </Box>
      </Stack>
   )
}
