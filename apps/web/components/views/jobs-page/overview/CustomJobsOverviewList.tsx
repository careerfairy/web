import { Box, Stack } from "@mui/material"
import { useEffect, useMemo, useRef } from "react"

import { Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import { RECOMMENDED_JOBS_LIMIT } from "pages/jobs/[[...livestreamDialog]]"
import { sxStyles } from "types/commonTypes"
import { scrollTop } from "util/CommonUtil"
import { useJobsOverviewContext } from "../JobsOverviewContext"
import { CustomJobsList } from "./CustomJobsList"
import { AnonymousRecommendedJobs } from "./recommendation/AnonymousRecommendedJobs"
import { AuthedRecommendedJobs } from "./recommendation/AuthedRecommendedJobs"
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
   const title = isLoggedIn ? "Right for you" : "Trending jobs"

   return (
      <Stack spacing={1}>
         <Typography variant="medium" sx={styles.listTitle}>
            {title}
            {" 🚀"}
         </Typography>
         <RecommendedJobs />
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
   return (
      <Stack spacing={1} mt={2}>
         <Typography variant="medium" sx={styles.listTitle}>
            Other jobs you might like
         </Typography>
         <RecommendedJobs />
      </Stack>
   )
}

const RecommendedJobs = () => {
   const { authenticatedUser } = useAuth()

   if (!authenticatedUser?.email)
      return (
         <AnonymousRecommendedJobs
            limit={RECOMMENDED_JOBS_LIMIT}
            forceFetch
            bypassCache
         />
      )

   return (
      <AuthedRecommendedJobs
         userAuthId={authenticatedUser.uid}
         limit={RECOMMENDED_JOBS_LIMIT}
         forceFetch
         bypassCache
      />
   )
}
