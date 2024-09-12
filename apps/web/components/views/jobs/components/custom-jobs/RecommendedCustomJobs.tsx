import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJobsByUser from "components/custom-hook/custom-job/useCustomJobsByUser"
import { useCallback, useState } from "react"
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
      ml: 2,
   },
   jobListWrapper: {
      px: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
   },
})

const RecommendedCustomJobs = () => {
   return (
      <Stack spacing={0} m={0} p={0}>
         <Typography
            variant="brandedH4"
            sx={styles.heading}
            color="black"
            ml={2}
         >
            Jobs matching your interests
         </Typography>
         <SuspenseWithBoundary fallback={<RecommendedCustomJobsSkeleton />}>
            <Content />
         </SuspenseWithBoundary>
      </Stack>
   )
}

const Content = () => {
   const [batchSize, setBatchSize] = useState<number>(ITEMS_PER_BATCH)

   const { customJobs, totalCount } = useCustomJobsByUser(batchSize)

   const onSeeMore = useCallback(() => {
      setBatchSize(batchSize + ITEMS_PER_BATCH)
   }, [setBatchSize, batchSize])

   const seeMoreDisabled = customJobs.length == totalCount

   return (
      <Stack direction={"column"} sx={{ width: "100%" }} spacing={0}>
         <Stack sx={styles.jobListWrapper}>
            {customJobs.map((job) => job.id).join(", ")}
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

const RecommendedCustomJobsSkeleton = () => {
   return (
      <Box>
         <Skeleton>skeleton</Skeleton>
      </Box>
   )
}

export default RecommendedCustomJobs
