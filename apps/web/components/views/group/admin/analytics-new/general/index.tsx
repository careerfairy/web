import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import useGroupCompanyPageProgress from "../../../../../custom-hook/useGroupCompanyPageProgress"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import AggregatedAnalytics, {
   SkeletonAggregatedAnalytics,
} from "./analytics/AggregatedAnalytics"
import AggregatedBreakdown from "./breakdown/AggregatedBreakdown"
import CompanyPageCTA from "./company-page/CompanyPageCTA"
import { GeneralPageProvider } from "./GeneralPageProvider"
import LivestreamsKPIs from "./livestreams-kpis/LivestreamsKPIs"
import GeneralSearchFilter from "./search-filter/GeneralSearchFilter"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const AnalyticsGeneralPageContent = () => {
   return (
      <GeneralPageProvider>
         <MemoizedPageContent />
      </GeneralPageProvider>
   )
}

const PageContent = () => {
   const { group } = useGroup()

   const progress = useGroupCompanyPageProgress(group)

   return (
      <Container maxWidth="xl">
         <Box py={2} px={1.5}>
            <Grid container spacing={spacing}>
               <Grid xs={12} item style={styles.gridItem}>
                  <GeneralSearchFilter />
               </Grid>

               <Grid
                  xs={12}
                  md={6}
                  item
                  container
                  spacing={spacing}
                  style={styles.gridItem}
               >
                  {progress?.isComplete ? null : (
                     <Grid xs={12} item style={styles.gridItem}>
                        <CompanyPageCTA progress={progress} />
                     </Grid>
                  )}

                  <Grid xs={12} item style={styles.gridItem}>
                     <LivestreamsKPIs />
                  </Grid>
                  <Grid xs={12} item style={styles.gridItem}>
                     <SuspenseWithBoundary
                        fallback={<SkeletonAggregatedAnalytics />}
                     >
                        <AggregatedAnalytics progress={progress} />
                     </SuspenseWithBoundary>
                  </Grid>
               </Grid>
               {/* Vertical Middle of UI */}
               <Grid xs={12} md={6} item style={styles.gridItem}>
                  <AggregatedBreakdown />
               </Grid>
            </Grid>
         </Box>
      </Container>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsGeneralPageContent
