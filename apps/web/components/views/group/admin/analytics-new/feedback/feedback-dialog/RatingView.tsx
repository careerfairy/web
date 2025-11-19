import {
   Box,
   LinearProgress,
   linearProgressClasses,
   Stack,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   ratingBox: {
      p: 1.5,
      borderRadius: 1,
      border: 1,
      borderColor: (theme) => theme.brand.white[400],
      backgroundColor: (theme) => theme.brand.black[100],
      width: "100%",
      overflow: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: "#E1E1E1 transparent",
      "&::-webkit-scrollbar": {
         height: 4,
      },
      "&::-webkit-scrollbar-track": {
         backgroundColor: "transparent",
      },
      "&::-webkit-scrollbar-thumb": {
         backgroundColor: (theme) => theme.brand.black[500],
         borderRadius: 2,
         "&:hover": {
            backgroundColor: (theme) => theme.brand.black[600],
         },
      },
   },
   averageBox: {
      p: 2,
      borderRadius: 0.5,
      backgroundColor: (theme) => theme.brand.black[400],
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: 151,
      flexShrink: 0,
   },
   chartContainer: {
      display: "flex",
      flexDirection: "row",
      gap: 2.5,
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      minWidth: "max-content",
   },
   chartColumn: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
      width: 132,
      flexShrink: 0,
      scrollSnapAlign: "start",
      px: {
         md: 1,
      },
      py: {
         xs: 1,
         md: 1.5,
      },
   },
   chartHeader: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      whiteSpace: "nowrap",
      mb: 1.25,
      color: "text.secondary",
   },
   linearProgress: {
      width: "100%",
      height: 4,
      borderRadius: 4,
      backgroundColor: "neutral.100",
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: 4,
         backgroundColor: "secondary.main",
      },
   },
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
   const isMobile = useIsMobile()
   return (
      <Box sx={styles.ratingBox}>
         <Stack
            direction="row"
            spacing={2.5}
            alignItems="stretch"
            sx={{ minWidth: "max-content" }}
         >
            <Box sx={{ ...styles.averageBox, scrollSnapAlign: "start" }}>
               <Typography
                  variant="small"
                  color={isMobile ? "text.secondary" : "neutral.800"}
               >
                  Average rating
               </Typography>
               <Typography
                  variant="brandedH1"
                  fontWeight={600}
                  color="neutral.800"
               >
                  {average.toFixed(1)}
               </Typography>
               <Typography variant="xsmall" color="text.secondary">
                  {total} total answers
               </Typography>
            </Box>
            <Box sx={styles.chartContainer}>
               {[1, 2, 3, 4, 5].map((rating) => {
                  const count = stats[rating] || 0
                  const percentage = total > 0 ? (count / total) * 100 : 0
                  return (
                     <BrandedTooltip
                        key={rating}
                        title={
                           RATING_LABELS[rating as keyof typeof RATING_LABELS]
                        }
                        arrow
                        placement="top"
                     >
                        <Box sx={styles.chartColumn}>
                           <Box sx={styles.chartHeader}>
                              <Typography
                                 variant="desktopBrandedH5"
                                 fontWeight={600}
                              >
                                 {rating}
                              </Typography>
                              <Typography variant="small" sx={{ ml: 1 }}>
                                 {count} votes ({Math.round(percentage)}%)
                              </Typography>
                           </Box>
                           <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={styles.linearProgress}
                           />
                        </Box>
                     </BrandedTooltip>
                  )
               })}
            </Box>
         </Stack>
      </Box>
   )
}
