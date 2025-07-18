import { Container, Grid, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import AggregatedAnalytics from "./analytics/AggregatedAnalytics"
import AggregatedUniversitySources from "./analytics/AggregatedUniversitySources"
import {
   LivestreamAnalyticsPageProvider,
   useLivestreamsAnalyticsPageContext,
} from "./LivestreamAnalyticsPageProvider"
import LivestreamSearchNav from "./search/LivestreamSearchNav"
import UsersTable from "./users/UsersTable"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const LivestreamAnalyticsPageContent = () => {
   return (
      <LivestreamAnalyticsPageProvider>
         <MemoizedPageContent />
      </LivestreamAnalyticsPageProvider>
   )
}

const PageContent = () => {
   const { currentStreamStats } = useLivestreamsAnalyticsPageContext()

   const noStreams = currentStreamStats === null

   return (
      <Container maxWidth="xl">
         <Box py={2} px={1.5}>
            <Grid container spacing={spacing}>
               <Grid xs={12} item style={styles.gridItem}>
                  <LivestreamSearchNav />
               </Grid>
               {noStreams ? ( // we don't fetch the document if we are not on the details page
                  <Grid xs={12} item style={styles.gridItem}>
                     <SearchPageContent />
                  </Grid>
               ) : (
                  <>
                     <Grid xs={12} item style={styles.gridItem}>
                        <AggregatedAnalytics />
                     </Grid>
                     <Grid xs={12} item style={styles.gridItem}>
                        <AggregatedUniversitySources />
                     </Grid>
                     <Grid xs={12} item style={styles.gridItem}>
                        <UsersTable />
                     </Grid>
                  </>
               )}
            </Grid>
         </Box>
      </Container>
   )
}

const SearchPageContent = () => {
   return (
      <Box width="100%" py={7}>
         <Typography align="center" variant="h6">
            Create a live stream to collect analytics.
         </Typography>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default LivestreamAnalyticsPageContent
