import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import {
   AnalyticsPageProvider,
   useAnalyticsPageContext,
} from "./AnalyticsPageProvider"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import Loader from "../../../loader/Loader"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const GeneralAnalyticsPageContent = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <AnalyticsPageProvider>
            <MemoizedPageContent />
         </AnalyticsPageProvider>
      </SuspenseWithBoundary>
   )
}

const PageContent = () => {
   const context = useAnalyticsPageContext()
   console.log("-> context", context)

   return (
      <Box py={2}>
         <Container maxWidth={false}>
            <Grid container spacing={3}>
               <Grid xs={12} md={6} item style={styles.gridItem}>
                  hi
               </Grid>

               <Grid xs={12} md={6} item style={styles.gridItem}>
                  hi
               </Grid>

               <Grid xs={12} md={6} item style={styles.gridItem}>
                  hi
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const MemoizedPageContent = memo(PageContent)

export default GeneralAnalyticsPageContent
