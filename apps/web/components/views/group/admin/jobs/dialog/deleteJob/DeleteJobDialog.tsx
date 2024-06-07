import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, CircularProgress } from "@mui/material"
import { FC, useCallback, useEffect, useState } from "react"
import { Trash2 as DeleteIcon } from "react-feather"
import { useDispatch, useSelector } from "react-redux"
import JobFetchWrapper from "../../../../../../../HOCs/job/JobFetchWrapper"
import { openDeleteJobWithLinkedContent } from "../../../../../../../store/reducers/adminJobsReducer"
import { jobsFormSelectedJobIdSelector } from "../../../../../../../store/selectors/adminJobsSelectors"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"
import useCustomJobDelete from "../../../../../../custom-hook/custom-job/useCustomJobDelete"
import SteppedDialog, {
   useStepper,
} from "../../../../../stepped-dialog/SteppedDialog"
import { JobDialogStep } from "../index"
import DeleteJobDialogWithLinkedContent from "./DeleteJobDialogWithLinkedContent"

const styles = sxStyles({
   wrapContainer: {
      height: {
         xs: "320px",
         md: "100%",
      },
   },
   reducePadding: {
      px: { xs: 3, md: "28px !important" },
      height: {
         xs: "500px",
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      my: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
   },
   title: {
      fontSize: { xs: "18px", md: "20px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   actions: {
      width: "100%",
      display: "flex",
      justifyContent: "space-evenly",
      borderTop: "none !important",
   },
   cancelBtn: {
      color: "grey",
   },
   actionBtn: {
      width: "160px",
      height: "40px",
      boxShadow: "none",
   },
})

const DeleteJobDialog = () => {
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)

   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <JobFetchWrapper jobId={selectedJobId}>
            {(job) => <DeleteDialog job={job} />}
         </JobFetchWrapper>
      </SuspenseWithBoundary>
   )
}

type DeleteDialogProps = {
   job: CustomJob | null
}
const DeleteDialog: FC<DeleteDialogProps> = ({ job }) => {
   const dispatch = useDispatch()
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const { handleClose } = useStepper<JobDialogStep>()
   const { isDeleting, handleDelete } = useCustomJobDelete(selectedJobId)
   const [hasLinkedContent, setHasLinkedContent] = useState(false)

   useEffect(() => {
      if (!isDeleting && job) {
         setHasLinkedContent(
            Boolean(job.livestreams.length || job.sparks.length)
         )
      }
   }, [isDeleting, job])

   useEffect(() => {
      if (hasLinkedContent) {
         dispatch(openDeleteJobWithLinkedContent())
      }
   }, [dispatch, hasLinkedContent])

   const handleJobDelete = useCallback(async () => {
      await handleDelete()
      handleClose()
   }, [handleClose, handleDelete])

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={[
            styles.wrapContainer,
            hasLinkedContent ? styles.reducePadding : null,
         ]}
         hideCloseButton
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <Box sx={styles.info}>
                  {hasLinkedContent ? (
                     <DeleteJobDialogWithLinkedContent job={job} />
                  ) : (
                     <DeleteJobWithoutLinkedContent />
                  )}
               </Box>
            </SteppedDialog.Content>

            <SteppedDialog.Actions sx={styles.actions}>
               <SteppedDialog.Button
                  variant="outlined"
                  color="grey"
                  onClick={handleClose}
                  sx={[styles.cancelBtn, styles.actionBtn]}
               >
                  Cancel
               </SteppedDialog.Button>

               <SteppedDialog.Button
                  variant="contained"
                  color={"error"}
                  disabled={isDeleting}
                  type="submit"
                  onClick={handleJobDelete}
                  loading={isDeleting}
                  sx={styles.actionBtn}
               >
                  {hasLinkedContent ? "Delete" : "Yes, I'm sure"}
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

const DeleteJobWithoutLinkedContent = () => (
   <>
      <Box mb={2}>
         <DeleteIcon color={"#FF4545"} size={48} />
      </Box>

      <SteppedDialog.Title sx={styles.title}>
         Delete job opening?
      </SteppedDialog.Title>

      <SteppedDialog.Subtitle sx={styles.subtitle}>
         Are you sure you want to delete this job opening? All data inserted and
         applicants’ details will be lost.
      </SteppedDialog.Subtitle>
   </>
)

export default DeleteJobDialog
