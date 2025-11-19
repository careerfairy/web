import { Box, Tooltip, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   container: {
      p: 1.5, // 12px
      borderRadius: 1, // 8px
      border: 1,
      borderColor: (theme) => theme.brand.white[400], // #F6F6FA
      backgroundColor: (theme) => theme.brand.black[100], // #FAFAFA
      width: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: 1.25, // 10px
   },
   mostVotedBox: {
      p: 2, // 16px
      borderRadius: 0.5, // 4px
      backgroundColor: "rgba(232, 232, 232, 0.5)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: 151,
      flexShrink: 0,
      gap: 1, // 8px
   },
   statsContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-end", // Align bars at bottom? Or stretch? Items are columns.
      // The items have fixed width and flex col.
      // gap: 23px -> approx 3 (24px)
      gap: 3,
      flexWrap: "wrap", // Just in case
      justifyContent: "flex-end",
      flex: 1,
      py: 1, // Add some vertical padding to match alignment if needed
   },
   statItem: {
      display: "flex",
      flexDirection: "column",
      gap: 1.5, // 12px
      width: 132,
      flexShrink: 0,
   },
   statTextRow: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
   },
   chartBarBg: {
      width: "100%",
      height: 4,
      borderRadius: 2, // Full radius for thin bar
      backgroundColor: (theme) => theme.brand.white[400], // #F6F6FA to match border/track
      position: "relative",
      overflow: "hidden",
   },
   chartBarFill: {
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%",
      borderRadius: 2,
      backgroundColor: "secondary.main",
   },
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
   5: "😁",
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
      <Box sx={styles.container}>
         {/* Most Voted Section */}
         <Box sx={styles.mostVotedBox}>
            <Typography
               variant="small"
               sx={{ color: "neutral.800", lineHeight: "20px" }}
            >
               Most voted
            </Typography>
            <Typography
               sx={{
                  fontSize: 38,
                  lineHeight: "50px",
                  color: "neutral.700",
               }}
            >
               {mostVotedEmoji}
            </Typography>
            <Typography
               variant="xsmall"
               sx={{ color: "neutral.500", lineHeight: "16px" }}
            >
               {total} total answers
            </Typography>
         </Box>

         {/* Stats Section - 1 to 5 */}
         <Box sx={styles.statsContainer}>
            {[1, 2, 3, 4, 5].map((val) => {
               const count = stats[val] || 0
               const percentage = total > 0 ? (count / total) * 100 : 0
               const emoji =
                  SENTIMENT_EMOJIS[val as keyof typeof SENTIMENT_EMOJIS]

               // Show all options 1-5 even if 0 votes, based on design
               return (
                  <Tooltip
                     key={val}
                     title={
                        SENTIMENT_LABELS[val as keyof typeof SENTIMENT_LABELS]
                     }
                     arrow
                     placement="top"
                  >
                     <Box sx={styles.statItem}>
                        <Box sx={styles.statTextRow}>
                           <Typography
                              sx={{
                                 fontSize: 20,
                                 lineHeight: "30px",
                                 color: "text.primary",
                              }}
                           >
                              {emoji}
                           </Typography>
                           <Typography
                              variant="small"
                              sx={{ color: "neutral.700" }}
                           >
                              {count} votes ({Math.round(percentage)}%)
                           </Typography>
                        </Box>
                        <Box sx={styles.chartBarBg}>
                           <Box
                              sx={[
                                 styles.chartBarFill,
                                 { width: `${percentage}%` },
                              ]}
                           />
                        </Box>
                     </Box>
                  </Tooltip>
               )
            })}
         </Box>
      </Box>
   )
}
