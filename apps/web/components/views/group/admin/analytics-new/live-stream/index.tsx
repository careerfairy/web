import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { LivestreamAnalyticsPageProvider } from "./LivestreamAnalyticsPageProvider"
import LivestreamSearchNav from "./search/LivestreamSearchNav"

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
   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={spacing}>
               <Grid xs={12} item style={styles.gridItem}>
                  <LivestreamSearchNav />
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default LivestreamAnalyticsPageContent
