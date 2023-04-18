import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import PaginatedFeedbacks from "./livestream-feedbacks/PaginatedFeedbacks"
import FeedbackSearch from "./search/FeedbackSearch"
import { FeedbackPageProvider } from "./FeedbackPageProvider"

const AnalyticsFeedbackPageContent = () => {
   return (
      <FeedbackPageProvider>
         <MemoizedPageContent />
      </FeedbackPageProvider>
   )
}

const PageContent = () => {
   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={spacing}>
               <Grid xs={12} item>
                  <FeedbackSearch />
               </Grid>
               <Grid xs={12} item>
                  <PaginatedFeedbacks />
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsFeedbackPageContent
