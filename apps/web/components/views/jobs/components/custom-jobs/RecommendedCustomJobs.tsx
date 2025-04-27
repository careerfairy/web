import { Button, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useCustomJobsByUser } from "components/custom-hook/custom-job/useCustomJobsByUser"
import useCustomJobsGroupNames from "components/custom-hook/custom-job/useCustomJobsGroupNames"
import { JobCardSkeleton } from "components/views/streaming-page/components/jobs/JobListSkeleton"
import { useCallback, useMemo, useState } from "react"
import { ChevronDown } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CustomJobsList from "./CustomJobsList"

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
   },
   jobsWrapper: {
      width: "100%",
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

export const RecommendedCustomJobs = () => {
   const { isLoggedOut } = useAuth()

   return (
      <Stack spacing={0} sx={styles.wrapper} id="highlighted-jobs">
         <Typography
            variant="brandedH4"
            sx={styles.heading}
            color="neutral.800"
         >
            {isLoggedOut ? "Highlighted jobs" : "Jobs matching your interests"}
         </Typography>
         <Content />
      </Stack>
   )
}

const Content = () => {
   const [batchSize, setBatchSize] = useState<number>(ITEMS_PER_BATCH)

   const {
      customJobs: allCustomJobs,
      totalCount,
      isLoading: isLoadingCustomJobs,
   } = useCustomJobsByUser()

   const customJobs = useMemo(() => {
      return allCustomJobs.slice(0, batchSize)
   }, [allCustomJobs, batchSize])

   const onSeeMore = useCallback(() => {
      setBatchSize(batchSize + ITEMS_PER_BATCH)
   }, [setBatchSize, batchSize])

   const { data: jobsGroupNamesMap, isLoading: isLoadingGroupNamesMap } =
      useCustomJobsGroupNames(allCustomJobs)

   const seeMoreDisabled = customJobs.length == totalCount

   if (isLoadingCustomJobs || isLoadingGroupNamesMap) {
      return <RecommendedCustomJobsSkeleton />
   }

   return (
      <Stack sx={styles.jobsWrapper}>
         <CustomJobsList
            customJobs={customJobs}
            hrefLink="/portal/jobs"
            jobsGroupNamesMap={jobsGroupNamesMap}
         />
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
