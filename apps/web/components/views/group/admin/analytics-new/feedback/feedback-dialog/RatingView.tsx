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

const RATING_LABELS = {
   1: "Very unsatisfied",
   2: "Unsatisfied",
   3: "Neutral",
   4: "Satisfied",
   5: "Very satisfied",
}

type RatingViewProps = {
   stats: Record<number, number>
   average: number
   total: number
}

export const RatingView = ({ stats, average, total }: RatingViewProps) => {
   return (
      <Stack spacing={3}>
         <Box sx={styles.ratingBox}>
            <Stack direction="row" spacing={3} alignItems="center">
               <Box sx={styles.averageBox}>
                  <Typography variant="small" color="text.primary">
                     Average rating
                  </Typography>
                  <Typography variant="brandedH1" sx={{ fontSize: "2.5rem" }}>
                     {average.toFixed(1)}
                  </Typography>
                  <Typography variant="xsmall" color="text.secondary">
                     {total} total answers
                  </Typography>
               </Box>
               <Stack flex={1} spacing={1.5}>
                  {[5, 4, 3, 2, 1].map((star) => {
                     const count = stats[star] || 0
                     const percentage = total > 0 ? (count / total) * 100 : 0
                     return (
                        <Tooltip
                           key={star}
                           title={
                              RATING_LABELS[star as keyof typeof RATING_LABELS]
                           }
                           arrow
                           placement="left"
                        >
                           <Box sx={styles.chartRow}>
                              <Typography
                                 variant="brandedH5"
                                 sx={{
                                    width: 20,
                                    textAlign: "center",
                                    color: "neutral.500",
                                 }}
                              >
                                 {star}
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
                                       star === 5
                                          ? { bgcolor: "secondary.main" }
                                          : star === 4
                                          ? { bgcolor: "secondary.light" }
                                          : star === 3
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
