import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { CloseOutlined } from "@mui/icons-material"
import { Box, IconButton, ListItem, Stack } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import JobCard from "components/views/common/jobs/JobCard"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   heroContent: {
      pb: "0px !important",
      pr: "8px !important",
      pt: "8px !important",
   },
   title: {
      maxWidth: "calc(100% - 50px)",
   },
   typography: {
      maxWidth: "calc(100% - 50px)",
   },
   jobListItemWrapper: { m: 0, p: 0 },
})

type Props = {
   jobs: CustomJob[]
}

const GroupJobsList = ({ jobs: groupCustomJobs }: Props) => {
   const router = useRouter()
   const routerJobId = router.asPath.split("jobs/")?.at(1)

   const [selectedJob, setSelectedJob] = useState<CustomJob>(() => {
      if (routerJobId) {
         return groupCustomJobs.find((job) => job.id === routerJobId)
      }
   })

   const [isJobsDialogOpen, handleOpenJobsDialog, handleCloseJobsDialog] =
      useDialogStateHandler(Boolean(selectedJob))

   const onCloseJobDialog = useCallback(() => {
      handleCloseJobsDialog()
      setSelectedJob(null)
      router.push(`/company/${router.query.companyName}`, undefined, {
         shallow: true,
      })
   }, [setSelectedJob, handleCloseJobsDialog, router])

   const onClickJobCard = useCallback(
      (customJob: CustomJob) => {
         setSelectedJob(customJob)
         handleOpenJobsDialog()
      },
      [setSelectedJob, handleOpenJobsDialog]
   )

   const isMobile = useIsMobile("lg")

   if (!groupCustomJobs?.length) return null

   return (
      <Stack width={"100%"} spacing={2}>
         <CustomJobDetailsDialog
            customJob={selectedJob}
            onClose={onCloseJobDialog}
            isOpen={isJobsDialogOpen}
            context={{ type: "companyPage", id: selectedJob?.groupId }}
            heroSx={styles.heroContent}
            heroContent={
               <Box display={"flex"} flexDirection={"row-reverse"} p={0} m={0}>
                  <IconButton onClick={onCloseJobDialog}>
                     <CloseOutlined />
                  </IconButton>
               </Box>
            }
         />
         {groupCustomJobs.map((customJob, idx) => {
            return (
               <Link
                  href={`/company/${router.query.companyName}/jobs/${customJob.id}`}
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
                        titleSx={isMobile ? null : styles.title}
                        typographySx={isMobile ? null : styles.typography}
                        handleClick={() => onClickJobCard(customJob)}
                        hideJobUrl
                        smallCard={isMobile}
                     />
                  </ListItem>
               </Link>
            )
         })}
      </Stack>
   )
}

export default GroupJobsList
