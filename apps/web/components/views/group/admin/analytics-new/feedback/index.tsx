import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { FeedbackPageProvider } from "./FeedbackPageProvider"
import PaginatedFeedbacks from "./livestream-feedbacks/PaginatedFeedbacks"
import FeedbackSearch from "./search/FeedbackSearch"

const AnalyticsFeedbackPageContent = () => {
   return (
      <FeedbackPageProvider>
         <MemoizedPageContent />
      </FeedbackPageProvider>
   )
}

const PageContent = () => {
   return (
      <Container maxWidth="xl">
         <Box py={2} px={1.5}>
            <Grid container spacing={spacing}>
               <Grid xs={12} item>
                  <FeedbackSearch />
               </Grid>
               <Grid xs={12} item>
                  <PaginatedFeedbacks />
               </Grid>
            </Grid>
         </Box>
      </Container>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsFeedbackPageContent
