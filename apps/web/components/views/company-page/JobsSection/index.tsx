import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { CloseOutlined } from "@mui/icons-material"
import {
   Box,
   IconButton,
   ListItem,
   Skeleton,
   Stack,
   Typography,
} from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import JobCard from "components/views/common/jobs/JobCard"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
})

type Props = {
   groupId: string
}

const JobsSection = (props: Props) => {
   const isMounted = useIsMounted()
   return isMounted ? (
      <SuspenseWithBoundary fallback={<JobsSectionDetailsSkeleton />}>
         <JobsSectionDetails {...props} />
      </SuspenseWithBoundary>
   ) : null
}

const JobsSectionDetails = ({ groupId }: Props) => {
   const groupCustomJobs = useGroupCustomJobs(groupId)
   const [isJobsDialogOpen, handleOpenJobsDialog, handleCloseJobsDialog] =
      useDialogStateHandler()

   const [selectedJob, setSelectedJob] = useState<CustomJob>()

   const onCloseJobDialog = useCallback(() => {
      setSelectedJob(null)
      handleCloseJobsDialog()
   }, [setSelectedJob, handleCloseJobsDialog])

   const onClickJobCard = useCallback(
      (customJob: CustomJob) => {
         setSelectedJob(customJob)
         handleOpenJobsDialog()
      },
      [setSelectedJob, handleOpenJobsDialog]
   )

   if (!groupCustomJobs?.length) return null

   if (selectedJob) {
      return (
         <CustomJobDetailsDialog
            customJob={selectedJob}
            onClose={onCloseJobDialog}
            isOpen={isJobsDialogOpen}
            context={{ type: "companyPage", id: selectedJob.groupId }}
            heroSx={{
               pb: "0px !important",
               pr: "8px !important",
               pt: "8px !important",
            }}
            heroContent={
               <Box display={"flex"} flexDirection={"row-reverse"} p={0} m={0}>
                  <IconButton onClick={onCloseJobDialog}>
                     <CloseOutlined />
                  </IconButton>
                  {/* <Button
                      
                     startIcon={<CloseOutlined />}
                     color="black"
                     onClick={onCloseJobDialog}
                  />  */}
               </Box>
            }
         />
      )
   }

   return (
      <Stack width={"100%"} spacing={2}>
         <Box sx={styles.titleSection}>
            <Typography variant="h4" fontWeight={"600"} color="black">
               Jobs
            </Typography>
         </Box>
         {groupCustomJobs.map((customJob, idx) => {
            return (
               <ListItem key={idx} sx={{ m: 0, p: 0 }}>
                  {/* TODO-WG: Pass hero with X for close */}

                  <JobCard
                     job={customJob}
                     previewMode
                     titleSx={{
                        maxWidth: "calc(100% - 70px)",
                     }}
                     handleClick={() => onClickJobCard(customJob)}
                     hideJobUrl
                  />
               </ListItem>
            )
         })}
      </Stack>
   )
}

const JobsSectionDetailsSkeleton = () => {
   return (
      <Stack>
         <Skeleton sx={{ m: 2 }} />
         <Skeleton sx={{ p: 4 }} />
      </Stack>
   )
}

export default JobsSection
