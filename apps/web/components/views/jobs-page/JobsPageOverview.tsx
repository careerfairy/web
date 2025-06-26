import { Container, Stack } from "@mui/material"
import { usePreFetchRecommendedJobs } from "components/custom-hook/custom-job/useRecommendedJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"
import { useJobsOverviewContext } from "./JobsOverviewContext"
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
      height: {
         xs: "100%",
         sm: "100%",
         md: "calc(100dvh - 176px)",
      },
      minHeight: {
         md: "calc(100dvh - 176px)",
      },
      maxHeight: {
         md: "calc(100dvh - 176px)",
      },
      overflow: "hidden",
   },
})

const JobsPageOverview = () => {
   const isMobile = useIsMobile()
   const { hasFilters } = useJobsOverviewContext()

   usePreFetchRecommendedJobs({
      limit: 10,
   })

   return (
      <Container maxWidth="xl" sx={styles.container}>
         <Stack spacing={2}>
            <OverviewSearch />
            <SearchResultsCount />
            <Stack
               direction={isMobile ? "column" : "row"}
               spacing={1}
               sx={[
                  styles.jobsContainer,
                  hasFilters &&
                     !isMobile && {
                        maxHeight: "calc(100dvh - 216px) !important",
                        minHeight: "calc(100dvh - 216px) !important",
                     },
               ]}
            >
               <CustomJobsOverviewList />
               <CustomJobDetails />
            </Stack>
         </Stack>
      </Container>
   )
}

export default JobsPageOverview
