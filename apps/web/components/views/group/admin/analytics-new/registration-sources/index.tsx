import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import React, { memo, useEffect, useMemo } from "react"
import Sources from "../../analytics/RegistrationSources"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import GeneralSearchFilter from "../general/search-filter/GeneralSearchFilter"
import {
   GeneralPageProvider,
   useAnalyticsPageContext,
} from "../general/GeneralPageProvider"

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
      <Box py={2}>
         <Container maxWidth={false}>
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
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsRegistrationSourcesPageContent
