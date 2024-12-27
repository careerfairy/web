import {
   CustomJob,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack } from "@mui/material"
import useCustomJobs from "components/custom-hook/custom-job/useCustomJobs"
import useClientSidePagination from "components/custom-hook/utils/useClientSidePagination"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { BrandedPagination } from "components/views/common/BrandedPagination"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import JobCard from "components/views/common/jobs/JobCard"
import { JobCardSkeleton } from "components/views/streaming-page/components/jobs/JobListSkeleton"
import { useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import { useJobsBlock } from "./control/JobsBlockContext"
import { EmptyJobsView } from "./EmptyJobsView"
import { LiveStreamDialogExtended } from "./LiveStreamDialogExtended"

const styles = sxStyles({
   jobList: {
      minHeight: { xs: "660px", md: "630px" },
   },
   heroSx: {
      py: "8px !important",
   },
})

export const JobsList = () => {
   const {
      blockId,
      selectedJobTypesIds,
      selectedJobAreasIds,
      selectedJob,
      handleCloseJobDialog,
      handleJobCardClick,
   } = useJobsBlock()

   const { customJobs: allCustomJobs } = useCustomJobs({
      businessFunctionTagIds: selectedJobAreasIds,
      jobTypesIds: selectedJobTypesIds,
   })

   const {
      currentPageData: results,
      currentPage,
      totalPages,
      goToPage,
   } = useClientSidePagination({
      data: allCustomJobs,
      itemsPerPage: 4,
   })

   const onPageChange = useCallback(
      (_event: React.ChangeEvent<unknown>, value: number) => {
         goToPage(value)
      },
      [goToPage]
   )

   return (
      <>
         {results?.length ? (
            <>
               <Stack spacing={1} sx={styles.jobList}>
                  {results.map((job: CustomJob) => (
                     <Box key={job.id}>
                        <SuspenseWithBoundary fallback={<JobCardSkeleton />}>
                           <JobCard
                              job={job}
                              handleClick={handleJobCardClick}
                              previewMode
                              smallCard
                           />
                        </SuspenseWithBoundary>
                     </Box>
                  ))}
               </Stack>
               <BrandedPagination
                  count={totalPages}
                  page={currentPage}
                  color="primary"
                  onChange={onPageChange}
                  size="large"
                  showLastButton={false}
                  showFirstButton={false}
                  boundaryCount={0}
               />
               {selectedJob ? (
                  <CustomJobDetailsDialog
                     customJobId={selectedJob.id}
                     isOpen={Boolean(selectedJob)}
                     onClose={handleCloseJobDialog}
                     source={{
                        source: CustomJobApplicationSourceTypes.Levels,
                        id: blockId,
                     }}
                     heroContent={
                        <CustomJobDetailsDialog.CloseButton
                           onClose={handleCloseJobDialog}
                        />
                     }
                     heroSx={styles.heroSx}
                  />
               ) : null}
               <LiveStreamDialogExtended />
            </>
         ) : (
            <EmptyJobsView />
         )}
      </>
   )
}
