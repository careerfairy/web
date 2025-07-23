import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Grid } from "@mui/material"
import { memo, useEffect, useMemo } from "react"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import Sources from "../../analytics/RegistrationSources"
import { LivestreamAnalyticsContainer } from "../LivestreamAnalyticsContainer"
import {
   GeneralPageProvider,
   useAnalyticsPageContext,
} from "../general/GeneralPageProvider"
import GeneralSearchFilter from "../general/search-filter/GeneralSearchFilter"

const AnalyticsRegistrationSourcesPageContent = () => {
   return (
      <GeneralPageProvider>
         <MemoizedPageContent />
      </GeneralPageProvider>
   )
}

const PageContent = () => {
   const { group } = useGroup()
   const { livestreamStats, setLivestreamStatsTimeFrame } =
      useAnalyticsPageContext()

   useEffect(() => {
      // start with last 1 year as the default time frame
      setLivestreamStatsTimeFrame("Last 1 year")
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const isLoading = useMemo(
      () => livestreamStats === undefined,
      [livestreamStats]
   )
   const mappedEvents = useMemo<LivestreamEvent[]>(
      () =>
         livestreamStats?.map(
            (stream) => stream.livestream as LivestreamEvent
         ) || [],
      [livestreamStats]
   )

   return (
      <LivestreamAnalyticsContainer>
         <Grid container spacing={spacing}>
            <Grid xs={12} item>
               <GeneralSearchFilter />
            </Grid>
            <Sources
               group={group}
               loading={isLoading}
               streamsFromTimeFrameAndFuture={mappedEvents}
            />
         </Grid>
      </LivestreamAnalyticsContainer>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsRegistrationSourcesPageContent
