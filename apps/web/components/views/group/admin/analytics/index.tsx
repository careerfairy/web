import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { AnalyticsPageProvider } from "./AnalyticsPageProvider"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import Loader from "../../../loader/Loader"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const GeneralAnalyticsPageContent = () => {
   return (
      <SuspenseWithBoundary showToastNotification fallback={<Loader />}>
         <AnalyticsPageProvider>
            <MemoizedPageContent />
         </AnalyticsPageProvider>
      </SuspenseWithBoundary>
   )
}

const PageContent = () => {
   const { groupPresenter } = useGroup()

   const hasAts = groupPresenter.atsAccounts?.length > 0
   const companyPageReady = groupPresenter.companyPageIsReady()
   const companyPageFullyReady = groupPresenter.companyPageIsFullyReady()

   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={spacing}>
               <Grid xs={12} item style={styles.gridItem}>
                  Search & Filter Bar
               </Grid>

               <Grid
                  xs={12}
                  md={6}
                  item
                  container
                  spacing={spacing}
                  style={styles.gridItem}
               >
                  {companyPageFullyReady ? null : (
                     <Grid xs={12} item style={styles.gridItem}>
                        Render Finish Company Page CTA
                     </Grid>
                  )}

                  <Grid xs={12} item style={styles.gridItem}>
                     Render Livestream KPIs
                  </Grid>

                  {companyPageReady ? (
                     <>
                        <Grid xs={6} item style={styles.gridItem}>
                           Render Company Page Views
                        </Grid>
                        <Grid xs={6} item style={styles.gridItem}>
                           Render Number of Followers
                        </Grid>
                     </>
                  ) : null}

                  {hasAts ? (
                     <>
                        <Grid xs={6} item style={styles.gridItem}>
                           Render Talent Pool
                        </Grid>
                        <Grid xs={6} item style={styles.gridItem}>
                           Render Applications Generated Through ATS
                        </Grid>
                     </>
                  ) : (
                     <>
                        <Grid xs={6} item style={styles.gridItem}>
                           Render Young Talent Reached
                        </Grid>
                        <Grid xs={6} item style={styles.gridItem}>
                           Render Average Registration per Stream
                        </Grid>
                     </>
                  )}
               </Grid>
               {/* Vertical Middle of UI */}
               <Grid xs={12} md={6} item style={styles.gridItem}>
                  Breakdown of Participants/Registrants by country and field of
                  study
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const spacing = 3
const MemoizedPageContent = memo(PageContent)

export default GeneralAnalyticsPageContent
