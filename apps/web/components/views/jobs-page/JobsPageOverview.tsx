import { Container, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { sxStyles } from "types/commonTypes"
import { CustomJobDetails } from "./overview/CustomJobDetails"
import { CustomJobsOverviewList } from "./overview/CustomJobsOverviewList"
import { OverviewSearch } from "./overview/search/OverviewSearch"

const styles = sxStyles({
   container: {
      px: "32px !important",
   },
})

const JobsPageOverview = () => {
   return (
      <Container maxWidth="xl" sx={styles.container}>
         <SuspenseWithBoundary>
            <Stack spacing={2}>
               <OverviewSearch />
               <Stack direction="row" spacing={1}>
                  <CustomJobsOverviewList />
                  <CustomJobDetails />
               </Stack>
            </Stack>
         </SuspenseWithBoundary>
      </Container>
   )
}

export default JobsPageOverview
