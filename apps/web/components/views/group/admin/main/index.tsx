import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import AggregatedAnalytics from "./analytics/AggregatedAnalytics"
import CardCustom from "./CardCustom"
import AggregatedFeedbackCard from "./feedback/AggregatedFeedbackCard"
import { MainPageProvider } from "./MainPageProvider"
import { AggregatedRegistrationSourcesCard } from "./registration-sources/AggregatedRegistrationSourcesCard"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const MainPageContent = () => {
   return (
      <MainPageProvider>
         <MemoizedPageContent />
      </MainPageProvider>
   )
}

const PageContent = () => {
   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={3}>
               <Grid xs={12} md={6} item style={styles.gridItem}>
                  <CardCustom title={""}>Next Livestream</CardCustom>
               </Grid>

               <Grid xs={12} md={6} item style={styles.gridItem}>
                  <AggregatedAnalytics />
               </Grid>

               <Grid xs={12} md={6} item style={styles.gridItem}>
                  <AggregatedRegistrationSourcesCard />
               </Grid>

               <Grid xs={12} md={6} item style={styles.gridItem}>
                  <AggregatedFeedbackCard />
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const MemoizedPageContent = memo(PageContent)

export default MainPageContent
