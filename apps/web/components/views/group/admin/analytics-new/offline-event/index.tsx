import { Box, Typography } from "@mui/material"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { LivestreamAnalyticsContainer } from "../LivestreamAnalyticsContainer"
import {
   OfflineEventAnalyticsPageProvider,
   useOfflineEventAnalyticsPageContext,
} from "./OfflineEventAnalyticsPageProvider"
import AggregatedAnalytics from "./analytics/AggregatedAnalytics"
import OfflineEventSearchNav from "./search/OfflineEventSearchNav"

const styles = sxStyles({
   rootContainer: {
      mt: 2,
      backgroundColor: "common.white",
      borderRadius: "20px",
      border: "1px solid",
      borderColor: "neutral.50",
      overflow: "hidden",
   },
   contentWrapper: {
      display: "flex",
      flexDirection: "column",
   },
})

const OfflineEventAnalyticsPageContent = () => {
   return (
      <OfflineEventAnalyticsPageProvider>
         <MemoizedPageContent />
      </OfflineEventAnalyticsPageProvider>
   )
}

const PageContent = () => {
   const { currentEventStats } = useOfflineEventAnalyticsPageContext()

   const noEvents = currentEventStats === null

   return (
      <LivestreamAnalyticsContainer>
         <Box sx={styles.rootContainer}>
            <Box sx={styles.contentWrapper}>
               <OfflineEventSearchNav />
               {noEvents ? <SearchPageContent /> : <AggregatedAnalytics />}
            </Box>
         </Box>
      </LivestreamAnalyticsContainer>
   )
}

const SearchPageContent = () => {
   return (
      <Box width="100%" py={7}>
         <Typography align="center" variant="h6">
            Create an offline event to collect analytics.
         </Typography>
      </Box>
   )
}

const MemoizedPageContent = memo(PageContent)

export default OfflineEventAnalyticsPageContent
