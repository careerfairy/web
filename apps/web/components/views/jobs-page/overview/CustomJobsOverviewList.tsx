import { Box, Stack } from "@mui/material"
import { useEffect, useMemo, useRef } from "react"

import { Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
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
      overflowY: "scroll",
   },
   listTitle: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
})

export const CustomJobsOverviewList = () => {
   const isMobile = useIsMobile()
   const { showDefaultJobs, showResultJobs, showOtherJobs, searchParams } =
      useJobsOverviewContext()

   const scrollableContainerRef = useRef<HTMLDivElement>(null)

   const filterParams = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { jobId, ...rest } = searchParams
      return JSON.stringify(rest)
   }, [searchParams])

   useEffect(() => {
      if (scrollableContainerRef.current && !isMobile) {
         scrollableContainerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
         })
      } else {
         scrollTop()
      }
   }, [filterParams, isMobile])

   return (
      <Stack sx={styles.root} spacing={2}>
         <NoResultsFound />
         <Box ref={scrollableContainerRef}>
            {showDefaultJobs ? <DefaultJobs /> : null}
            {showResultJobs ? <ResultJobs /> : null}
            {showOtherJobs ? <OtherJobs /> : null}
         </Box>
      </Stack>
   )
}

const DefaultJobs = () => {
   const { isLoggedIn } = useAuth()
   const { customJobs } = useJobsOverviewContext()
   const title = isLoggedIn ? "Right for you" : "Trending jobs"

   return (
      <Stack spacing={1}>
         <Typography variant="medium" sx={styles.listTitle}>
            {title}
            {" 🚀"}
         </Typography>
         {/* TODO: Replace with new Job Card */}
         <CustomJobsList customJobs={customJobs} />
      </Stack>
   )
}

const ResultJobs = () => {
   const { customJobs } = useJobsOverviewContext()

   return (
      <Stack spacing={1}>
         {/* TODO: Replace with new Job Card */}
         <CustomJobsList customJobs={customJobs} />
      </Stack>
   )
}

const OtherJobs = () => {
   const { customJobs } = useJobsOverviewContext()

   return (
      <Stack spacing={1}>
         <Typography variant="medium" sx={styles.listTitle}>
            Other jobs you might like
         </Typography>
         {/* TODO: Replace with new Job Card */}
         <CustomJobsList customJobs={customJobs} />
      </Stack>
   )
}
