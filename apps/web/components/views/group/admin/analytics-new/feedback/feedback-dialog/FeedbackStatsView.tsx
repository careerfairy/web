import {
   Box,
   LinearProgress,
   linearProgressClasses,
   Stack,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import HorizontalScroll from "components/views/common/HorizontalScroll"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { ReactNode } from "react"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   ratingBox: (theme) => ({
      p: 1.5,
      borderRadius: 2,
      border: 1,
      width: "100%",
      ...theme.utils.hideScrollbar,
      backgroundColor: {
         xs: theme.brand.white[200],
         md: theme.brand.black[100],
      },
      borderColor: {
         xs: theme.brand.white[500],
         md: theme.brand.white[400],
      },
   }),
   averageBox: {
      p: 2,
      borderRadius: 2,
      backgroundColor: (theme) => theme.brand.black[400],
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: { xs: "100%", md: 151 },
      flexShrink: 0,
      scrollSnapAlign: "start",
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
      width: 148,
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
   summaryValue: {
      fontWeight: 600,
      color: "neutral.800",
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
   },
   mobileHorizontalScroll: (theme) => ({
      width: "100%",
      ...theme.utils.hideScrollbar,
   }),
})

type FeedbackStatsViewProps = {
   stats: Record<number, number>
   total: number
   summaryTitle: string
   summaryValue: ReactNode
   getItemLabel: (value: number) => ReactNode
   getItemTooltip: (value: number) => string
}

export const FeedbackStatsView = ({
   stats,
   total,
   summaryTitle,
   summaryValue,
   getItemLabel,
   getItemTooltip,
}: FeedbackStatsViewProps) => {
   const isMobile = useIsMobile()

   const AverageSection = (
      <Box sx={styles.averageBox}>
         <Typography
            variant="small"
            color={isMobile ? "text.secondary" : "neutral.800"}
         >
            {summaryTitle}
         </Typography>
         <Typography
            variant="brandedH1"
            component="div"
            sx={styles.summaryValue}
         >
            {summaryValue}
         </Typography>
         <Typography variant="xsmall" color="text.secondary">
            {total} total answers
         </Typography>
      </Box>
   )

   const ChartSection = (
      <Box sx={styles.chartContainer}>
         {[1, 2, 3, 4, 5].map((value) => {
            const count = stats[value] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
               <BrandedTooltip
                  key={value}
                  title={getItemTooltip(value)}
                  arrow
                  placement="top"
               >
                  <Box sx={styles.chartColumn}>
                     <Box sx={styles.chartHeader}>
                        <Typography
                           variant="desktopBrandedH5"
                           fontWeight={600}
                           component="div"
                        >
                           {getItemLabel(value)}
                        </Typography>
                        <Typography variant="small" ml={1}>
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
   )

   if (isMobile) {
      return (
         <Box sx={styles.ratingBox}>
            <Stack direction="column" spacing={1.25}>
               {AverageSection}
               <HorizontalScroll sx={styles.mobileHorizontalScroll}>
                  {ChartSection}
               </HorizontalScroll>
            </Stack>
         </Box>
      )
   }

   return (
      <HorizontalScroll sx={styles.ratingBox}>
         <Stack
            direction="row"
            spacing={2.5}
            alignItems="stretch"
            minWidth="max-content"
         >
            {AverageSection}
            {ChartSection}
         </Stack>
      </HorizontalScroll>
   )
}
