import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { LivestreamAnalyticsPageProvider } from "./LivestreamAnalyticsPageProvider"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

export const LivestreamAnalyticsPageContent = () => {
   // Add necessary providers here
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
               livestream analytics page content
            </Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)
