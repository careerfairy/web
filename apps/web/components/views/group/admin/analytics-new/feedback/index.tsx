import { Grid } from "@mui/material"
import { memo } from "react"
import { LivestreamAnalyticsContainer } from "../LivestreamAnalyticsContainer"
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
      <LivestreamAnalyticsContainer>
         <Grid container spacing={spacing}>
            <Grid xs={12} item>
               <FeedbackSearch />
            </Grid>
            <Grid xs={12} item>
               <PaginatedFeedbacks />
            </Grid>
         </Grid>
      </LivestreamAnalyticsContainer>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsFeedbackPageContent
