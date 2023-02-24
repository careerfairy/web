import { Card, CardContent, Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import AggregatedAnalytics from "./analytics/AggregatedAnalytics"
import AggregatedFeedbackCard from "./feedback/AggregatedFeedbackCard"

const MainPageContent = () => {
   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={3}>
               <Grid xs={12} md={6} item>
                  <Card>
                     <CardContent>Next Livestreams</CardContent>
                  </Card>
               </Grid>

               <Grid xs={12} md={6} item>
                  <AggregatedAnalytics />
               </Grid>

               <Grid xs={12} md={6} item>
                  <Card>
                     <CardContent>Registration Sources</CardContent>
                  </Card>
               </Grid>

               <Grid xs={12} md={6} item>
                  <AggregatedFeedbackCard />
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

export default MainPageContent
