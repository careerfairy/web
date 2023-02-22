import { Card, CardContent, Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { sxStyles } from "types/commonTypes"
import AggregatedAnalytics from "./analytics/AggregatedAnalytics"
import AggregatedFeedbackCard from "./feedback/AggregatedFeedbackCard"
import { AggregatedRegistrationSourcesCard } from "./registration-sources/AggregatedRegistrationSourcesCard"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const MainPageContent = () => {
   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={3}>
               <Grid xs={12} md={6} item style={styles.gridItem}>
                  <Card>
                     <CardContent>Next Livestreams</CardContent>
                  </Card>
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

export default MainPageContent
