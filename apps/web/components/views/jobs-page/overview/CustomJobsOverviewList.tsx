import { Box, Stack } from "@mui/material"
import { useEffect, useMemo, useRef } from "react"

import { Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useRecommendedJobs from "components/custom-hook/custom-job/useRecommendedJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import CircularLoader from "components/views/loader/CircularLoader"
import { sxStyles } from "types/commonTypes"
import { scrollTop } from "util/CommonUtil"
import { useJobsOverviewContext } from "../JobsOverviewContext"
import { CustomJobsList } from "./CustomJobsList"
import { NoResultsFound } from "./search/SearchResultsCount"

const styles = sxStyles({
   root: {
      width: "339px",
      minWidth: {
         xs: "100%",
         md: "339px",
      },
      overflowY: "auto",
   },
   listTitle: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
})

export const CustomJobsOverviewList = () => {
   const isMounted = useIsMounted()
   const isMobile = useIsMobile()
   const {
      showDefaultJobs,
      showResultJobs,
      showOtherJobs,
      searchParams,
      hasFilters,
   } = useJobsOverviewContext()

   const scrollableContainerRef = useRef<HTMLDivElement>(null)

   const filterParams = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { jobId, ...rest } = searchParams
      return JSON.stringify(rest)
   }, [searchParams])

   useEffect(() => {
      if (!hasFilters || !isMounted) return
      setTimeout(() => {
         if (isMobile) {
            scrollTop()
         } else {
            scrollableContainerRef.current?.scrollIntoView({
               behavior: "smooth",
               block: "start",
            })
         }
      }, 200)
   }, [filterParams, isMobile, hasFilters, isMounted])

   return (
      <Stack sx={styles.root} spacing={2}>
         <Box ref={scrollableContainerRef}>
            <NoResultsFound />
            {showDefaultJobs ? <DefaultJobs /> : null}
            {showResultJobs ? <ResultJobs /> : null}
            {showOtherJobs ? <OtherJobs /> : null}
         </Box>
      </Stack>
   )
}

const DefaultJobs = () => {
   const { isLoggedIn } = useAuth()
   const { recommendedJobs: customJobs, isRecommendedJobsLoading } =
      useJobsOverviewContext()

   const title = isLoggedIn ? "Right for you" : "Trending jobs"

   return (
      <Stack spacing={1}>
         <Typography variant="medium" sx={styles.listTitle}>
            {title}
            {" 🚀"}
         </Typography>
         {isRecommendedJobsLoading ? <CircularLoader sx={{ mt: 2 }} /> : null}
         {!isRecommendedJobsLoading && customJobs?.length ? (
            <CustomJobsList customJobs={customJobs} />
         ) : null}
      </Stack>
   )
}

const ResultJobs = () => {
   const { customJobs } = useJobsOverviewContext()

   return (
      <Stack spacing={1}>
         <CustomJobsList customJobs={customJobs} />
      </Stack>
   )
}

const OtherJobs = () => {
   const { recommendationLimit, selectedJob } = useJobsOverviewContext()
   const { jobs: customJobs, loading: isRecommendedJobsLoading } =
      useRecommendedJobs({
         bypassCache: true, // Always bypass in this case to have shuffled results
         limit: recommendationLimit,
         referenceJobId: selectedJob?.id,
         forceFetch: true,
      })

   if (isRecommendedJobsLoading) return <CircularLoader sx={{ mt: 2 }} />

   if (!customJobs?.length) return null

   return (
      <Stack spacing={1} mt={2}>
         <Typography variant="medium" sx={styles.listTitle}>
            Other jobs you might like
         </Typography>
         <CustomJobsList customJobs={customJobs} />
      </Stack>
   )
}
