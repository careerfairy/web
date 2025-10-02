import { Grid, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { LivestreamAnalyticsContainer } from "../LivestreamAnalyticsContainer"
import {
   OfflineEventAnalyticsPageProvider,
   useOfflineEventAnalyticsPageContext,
} from "./OfflineEventAnalyticsPageProvider"

const styles = sxStyles({
   gridItem: {
      display: "flex",
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
         <Grid container spacing={spacing}>
            {noEvents ? (
               <Grid xs={12} item style={styles.gridItem}>
                  <SearchPageContent />
               </Grid>
            ) : (
               <>
                  <Grid xs={12} item style={styles.gridItem}>
                     <Box width="100%" py={4}>
                        <Typography align="center" variant="h6">
                           Offline Event Analytics Coming Soon
                        </Typography>
                        <Typography
                           align="center"
                           variant="body2"
                           sx={{ mt: 2 }}
                        >
                           Analytics for{" "}
                           {currentEventStats?.offlineEvent?.title ||
                              "this event"}{" "}
                           will be displayed here.
                        </Typography>
                     </Box>
                  </Grid>
               </>
            )}
         </Grid>
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

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default OfflineEventAnalyticsPageContent
