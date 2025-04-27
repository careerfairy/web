import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import { Button, Stack, Typography } from "@mui/material"
import useCustomJobs from "components/custom-hook/custom-job/useCustomJobs"
import useCustomJobsCount from "components/custom-hook/custom-job/useCustomJobsCount"
import useCustomJobsGroupNames from "components/custom-hook/custom-job/useCustomJobsGroupNames"
import CustomJobsList from "components/views/jobs/components/custom-jobs/CustomJobsList"
import { RecommendedCustomJobsSkeleton } from "components/views/jobs/components/custom-jobs/RecommendedCustomJobs"
import { useCallback, useMemo, useState } from "react"
import { ChevronDown } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   heading: {
      fontSize: "18px",
      fontWeight: 600,
      m: 2,
      mt: 4,
   },
   wrapper: {
      m: 0,
      p: 0,
   },
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
   jobsWrapper: {
      width: "100%",
   },
   jobListWrapper: {
      px: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
   },
   jobListItemWrapper: { m: 0, p: 0 },
})

const ITEMS_PER_BATCH = 3

type Props = {
   tags: GroupedTags
   title: string
}

const CustomJobsTagsContent = ({ tags, title }: Props) => {
   const businessFunctionTagIds = Object.keys(tags.businessFunctions)

   const { count } = useCustomJobsCount({
      businessFunctionTagIds: businessFunctionTagIds,
   })

   if (!count) return null

   return (
      <Stack spacing={0} sx={styles.wrapper}>
         <Typography sx={styles.heading} color="neutral.800">
            {title}
         </Typography>
         <Content
            businessFunctionTagIds={businessFunctionTagIds}
            totalCount={count}
         />
      </Stack>
   )
}

type ContentProps = {
   businessFunctionTagIds: string[]
   totalCount: number
}
const Content = ({ businessFunctionTagIds, totalCount }: ContentProps) => {
   const [batchSize, setBatchSize] = useState<number>(ITEMS_PER_BATCH)

   const { customJobs: allCustomJobs, isLoading: isLoadingCustomJobs } =
      useCustomJobs({
         businessFunctionTagIds: businessFunctionTagIds,
      })

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

export default CustomJobsTagsContent
