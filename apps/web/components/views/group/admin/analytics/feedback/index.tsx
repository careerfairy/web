import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { AnalyticsPageProvider } from "../AnalyticsPageProvider"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import Loader from "../../../../loader/Loader"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const AnalyticsFeedbackPageContent = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <AnalyticsPageProvider>
            <MemoizedPageContent />
         </AnalyticsPageProvider>
      </SuspenseWithBoundary>
   )
}

const PageContent = () => {
   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={spacing}></Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsFeedbackPageContent
