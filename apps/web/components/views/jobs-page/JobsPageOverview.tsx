import { Container, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useEffect, useMemo, useRef } from "react"
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
         md: "calc(100dvh - 176px)",
      },
      overflow: "hidden",
   },
})

const JobsPageOverview = () => {
   const isMobile = useIsMobile()
   const { hasFilters, searchParams } = useJobsOverviewContext()

   const scrollableContainerRef = useRef<HTMLDivElement>(null)

   const filterParams = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { jobId, ...rest } = searchParams
      return JSON.stringify(rest)
   }, [searchParams])

   useEffect(() => {
      scrollableContainerRef.current?.scrollIntoView({
         behavior: "smooth",
         block: "start",
      })
   }, [filterParams, isMobile])

   return (
      <Container
         maxWidth="xl"
         sx={styles.container}
         ref={scrollableContainerRef}
      >
         <Stack spacing={2}>
            <OverviewSearch />
            <SearchResultsCount />
            <Stack
               direction={isMobile ? "column" : "row"}
               spacing={1}
               sx={[
                  styles.jobsContainer,
                  hasFilters && {
                     height: "calc(100dvh - 216px) !important",
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
