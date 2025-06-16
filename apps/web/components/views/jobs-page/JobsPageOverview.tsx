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
      height: {
         xs: "100%",
         sm: "100%",
         md: "calc(100dvh - 176px)",
      },
      minHeight: {
         xs: "100%",
         sm: "100%",
         md: "calc(100dvh - 176px)",
      },
      maxHeight: {
         xs: "100%",
         sm: "100%",
         md: "calc(100dvh - 176px)",
      },
      // maxHeight: {
      //    xs: "63dvh",
      //    sm: "63dvh",
      //    md: "none",
      // },
      overflow: "auto",
   },
})

const JobsPageOverview = () => {
   const isMobile = useIsMobile()

   return (
      <Container maxWidth="xl" sx={styles.container}>
         <Stack spacing={2}>
            <OverviewSearch />
            {!isMobile ? <SearchResultsCount /> : null}
            <Stack
               direction={isMobile ? "column" : "row"}
               spacing={1}
               sx={[
                  styles.jobsContainer,
                  // hasFilters && {
                  //    height: "100% !important",
                  // },
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
