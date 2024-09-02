import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { CloseOutlined } from "@mui/icons-material"
import { Box, IconButton, ListItem, Stack } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import JobCard from "components/views/common/jobs/JobCard"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   heroContent: {
      pb: "0px !important",
      pr: "8px !important",
      pt: "8px !important",
   },
   title: {
      maxWidth: "calc(100% - 70px)",
   },
   jobListItemWrapper: { m: 0, p: 0 },
})

type Props = {
   jobs: CustomJob[]
}

const GroupJobsList = ({ jobs: groupCustomJobs }: Props) => {
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
            heroSx={styles.heroContent}
            heroContent={
               <Box display={"flex"} flexDirection={"row-reverse"} p={0} m={0}>
                  <IconButton onClick={onCloseJobDialog}>
                     <CloseOutlined />
                  </IconButton>
               </Box>
            }
         />
      )
   }

   return (
      <Stack width={"100%"} spacing={2}>
         {groupCustomJobs.map((customJob, idx) => {
            return (
               <ListItem key={idx} sx={styles.jobListItemWrapper}>
                  <JobCard
                     job={customJob}
                     previewMode
                     titleSx={styles.title}
                     handleClick={() => onClickJobCard(customJob)}
                     hideJobUrl
                  />
               </ListItem>
            )
         })}
      </Stack>
   )
}

export default GroupJobsList
