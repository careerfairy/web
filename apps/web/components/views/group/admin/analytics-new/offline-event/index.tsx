import { Box, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { memo, useEffect } from "react"
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
      overflow: "hidden",
   },
   rootDesktopContainer: {
      backgroundColor: "common.white",
      borderRadius: "20px",
      border: "1px solid",
      borderColor: "neutral.50",
   },
   contentWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: {
         xs: 1.5,
         md: 0,
      },
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
   const isMobile = useIsMobile()
   const { groupPresenter } = useGroup()
   const { currentEventStats } = useOfflineEventAnalyticsPageContext()
   const { replace } = useRouter()

   const noEvents = currentEventStats === null

   useEffect(() => {
      if (groupPresenter && !groupPresenter.canCreateOfflineEvents(true)) {
         replace(`/group/${groupPresenter.id}/admin`)
      }
   }, [groupPresenter, replace])

   return (
      <LivestreamAnalyticsContainer>
         <Box
            sx={[
               styles.rootContainer,
               !isMobile && styles.rootDesktopContainer,
            ]}
         >
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
