import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import { Button, ListItem, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJobs, {
   useCustomJobsCount,
} from "components/custom-hook/custom-job/useCustomJobs"
import useCustomJobsGroupNames from "components/custom-hook/custom-job/useCustomJobsGroupNames"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import { RecommendedCustomJobsSkeleton } from "components/views/jobs/components/custom-jobs/RecommendedCustomJobs"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { ChevronDown } from "react-feather"
import { sxStyles } from "types/commonTypes"
import JobCard from "../../jobs/JobCard"

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
   const featureFlags = useFeatureFlags()

   const { count } = useCustomJobsCount({
      businessFunctionTagIds: businessFunctionTagIds,
   })

   if (!featureFlags.jobHubV1 || !count) return null

   return (
      <Stack spacing={0} sx={styles.wrapper}>
         <Typography sx={styles.heading} color="neutral.800">
            {title}
         </Typography>
         <SuspenseWithBoundary fallback={<RecommendedCustomJobsSkeleton />}>
            <Content
               businessFunctionTagIds={businessFunctionTagIds}
               totalCount={count}
            />
         </SuspenseWithBoundary>
      </Stack>
   )
}

type ContentProps = {
   businessFunctionTagIds: string[]
   totalCount: number
}
const Content = ({ businessFunctionTagIds, totalCount }: ContentProps) => {
   const isMobile = useIsMobile()
   const [batchSize, setBatchSize] = useState<number>(ITEMS_PER_BATCH)

   const { customJobs: allCustomJobs } = useCustomJobs({
      businessFunctionTagIds: businessFunctionTagIds,
   })

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

export default CustomJobsTagsContent
