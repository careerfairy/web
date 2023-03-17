import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { GeneralPageProvider } from "./GeneralPageProvider"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import GeneralSearchFilter from "./search-filter/GeneralSearchFilter"
import CompanyPageCTA from "./company-page/CompanyPageCTA"
import LivestreamsKPIs from "./livestreams-kpis/LivestreamsKPIs"
import AggregatedAnalytics from "./analytics/AggregatedAnalytics"
import AggregatedBreakdown from "./breakdown/AggregatedBreakdown"
import useGroupCompanyPageProgress from "../../../../../custom-hook/useGroupCompanyPageProgress"

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
      <Box py={2}>
         <Container maxWidth={false}>
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
                     <AggregatedAnalytics />
                  </Grid>
               </Grid>
               {/* Vertical Middle of UI */}
               <Grid xs={12} md={6} item style={styles.gridItem}>
                  <AggregatedBreakdown />
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default AnalyticsGeneralPageContent
