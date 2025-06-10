import { Container, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"
import { CustomJobDetails } from "./overview/CustomJobDetails"
import { CustomJobsOverviewList } from "./overview/CustomJobsOverviewList"
import { OverviewSearch } from "./overview/search/OverviewSearch"
import { SearchResultsCount } from "./overview/search/SearchResultsCount"

const styles = sxStyles({
   container: {
      px: "0px !important",
      maxHeight: "100%",
   },
   jobsContainer: {
      px: {
         xs: "16px !important",
         sm: "16px !important",
         md: "32px !important",
      },
      minHeight: {
         md: "75dvh !important",
      },
      maxHeight: {
         md: "76dvh !important",
      },
      height: {
         // xs: "100dvh !important",
         // sm: "100dvh !important",
         md: "76dvh !important",
      },
      // height: "80vh",
      overflow: "hidden",
   },
})

const JobsPageOverview = () => {
   const isMobile = useIsMobile()

   return (
      <Container maxWidth="xl" sx={styles.container}>
         <Stack spacing={2}>
            <OverviewSearch />
            <SearchResultsCount />
            <Stack
               direction={isMobile ? "column" : "row"}
               spacing={1}
               sx={styles.jobsContainer}
            >
               <CustomJobsOverviewList />
               <CustomJobDetails />
            </Stack>
         </Stack>
      </Container>
   )
}

export default JobsPageOverview
