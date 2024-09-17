import { Button, ListItem, Skeleton, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJobsByUser from "components/custom-hook/custom-job/useCustomJobsByUser"
import useCustomJobsGroupNames from "components/custom-hook/custom-job/useCustomJobsGroupNames"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import JobCard from "components/views/common/jobs/JobCard"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { ChevronDown } from "react-feather"
import { sxStyles } from "types/commonTypes"

const ITEMS_PER_BATCH = 3

const styles = sxStyles({
   seeMore: (theme) => ({
      color: theme.palette.neutral[600],
      borderRadius: "20px",
      border: `1px solid ${theme.palette.neutral[200]}`,
      "&:hover": {
         background: theme.brand.black[400],
         color: theme.brand.black[700],
         border: `1px solid ${theme.palette.neutral[50]}`,
      },
      mx: "15px !important",
      mb: 4,
   }),
   heading: {
      fontWeight: 600,
      m: 2,
      mt: 4,
   },
   jobListWrapper: {
      px: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
   },
   jobListItemWrapper: { m: 0, p: 0 },
   wrapper: {
      m: 0,
      p: 0,
   },
})

const RecommendedCustomJobs = () => {
   const featureFlags = useFeatureFlags()
   const { isLoggedOut } = useAuth()
   if (!featureFlags.jobHubV1) return null
   return (
      <Stack spacing={0} sx={styles.wrapper}>
         <Typography
            variant="brandedH4"
            sx={styles.heading}
            color="neutral.800"
         >
            {isLoggedOut ? "Jobs in focus" : "Jobs matching your interests"}
         </Typography>
         <SuspenseWithBoundary fallback={<RecommendedCustomJobsSkeleton />}>
            <Content />
         </SuspenseWithBoundary>
      </Stack>
   )
}

const Content = () => {
   const isMobile = useIsMobile()
   const [batchSize, setBatchSize] = useState<number>(ITEMS_PER_BATCH)

   const { customJobs: allCustomJobs, totalCount } = useCustomJobsByUser()

   const customJobs = useMemo(() => {
      return allCustomJobs.slice(0, batchSize)
   }, [allCustomJobs, batchSize])

   const onSeeMore = useCallback(() => {
      setBatchSize(batchSize + ITEMS_PER_BATCH)
   }, [setBatchSize, batchSize])

   const { data: jobsGroupNamesMap } = useCustomJobsGroupNames(allCustomJobs)

   const seeMoreDisabled = customJobs.length == totalCount

   return (
      <Stack direction={"column"} sx={{ width: "100%" }} spacing={0}>
         <Stack sx={styles.jobListWrapper} width={"100%"} spacing={1}>
            {customJobs.map((customJob, idx) => {
               return (
                  <Link
                     href={`/portal/jobs/${customJob.id}`}
                     // Prevents GSSP from running on designated page:https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing
                     shallow
                     passHref
                     // Prevents the page from scrolling to the top when the link is clicked
                     scroll={false}
                     legacyBehavior
                     key={idx}
                  >
                     <ListItem sx={styles.jobListItemWrapper}>
                        <JobCard
                           job={customJob}
                           previewMode
                           hideJobUrl
                           smallCard={isMobile}
                           companyName={jobsGroupNamesMap[customJob.id]}
                        />
                     </ListItem>
                  </Link>
               )
            })}
         </Stack>
         {seeMoreDisabled ? undefined : (
            <Button
               disabled={seeMoreDisabled}
               onClick={onSeeMore}
               sx={[styles.seeMore]}
            >
               See more <ChevronDown />
            </Button>
         )}
      </Stack>
   )
}

export const RecommendedCustomJobsSkeleton = () => {
   return (
      <Stack sx={styles.jobListWrapper} width={"100%"} spacing={1}>
         <JobCardSkeleton />
         <JobCardSkeleton />
         <JobCardSkeleton />
      </Stack>
   )
}

const JobCardSkeleton = () => {
   return (
      <Stack direction={"column"}>
         <Skeleton height={"30px"} sx={{ mr: "20%" }} />
         <Skeleton height={"10px"} sx={{ mr: "50%" }} />
         <Stack direction={"row"} spacing={1}>
            <Skeleton width={"100px"} />
            <Skeleton width={"100px"} />
         </Stack>
         <Skeleton width={"80px"} height={"10px"} />
      </Stack>
   )
}

export default RecommendedCustomJobs
