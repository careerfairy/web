import SteppedDialog, {
   useStepper,
} from "../../../../stepped-dialog/SteppedDialog"
import { useSelector } from "react-redux"
import { jobsFormSelectedJobIdSelector } from "../../../../../../store/selectors/adminJobsSelectors"
import { sxStyles } from "../../../../../../types/commonTypes"
import Loader from "../../../../loader/Loader"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import JobFetchWrapper from "../../../../../../HOCs/job/JobFetchWrapper"
import { Trash2 as DeleteIcon, Radio } from "react-feather"
import { Box, Stack } from "@mui/material"
import useCustomJobDelete from "../../../../../custom-hook/custom-job/useCustomJobDelete"

const styles = sxStyles({
   wrapContainer: {
      height: {
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
      mt: 4,
   },
   cancelBtn: {
      color: "grey",
   },
   actionBtn: {
      width: "160px",
      height: "40px",
   },
   listWrapper: {},
   listItem: {},
})

const DeleteJobDialog = () => {
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const { handleClose } = useStepper()
   const { isDeleting, handleDelete } = useCustomJobDelete(selectedJobId)

   // TODO here check if the job as any livestream linked to it
   //  and decide which layout to show
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <JobFetchWrapper
            jobId={selectedJobId}
            shouldFetch={Boolean(selectedJobId)}
         >
            {(job) => (
               <SteppedDialog.Container
                  containerSx={styles.content}
                  sx={styles.wrapContainer}
                  hideCloseButton
               >
                  <>
                     <SteppedDialog.Content sx={styles.container}>
                        <Stack spacing={2} sx={styles.info}>
                           <Radio color={"#FF4545"} size={48} />

                           <SteppedDialog.Title sx={styles.title}>
                              This job post is linked to the following upcoming
                              live streams:
                           </SteppedDialog.Title>

                           <Box sx={styles.listWrapper}></Box>

                           <SteppedDialog.Subtitle sx={styles.subtitle}>
                              Deleting this job post will remove its links to
                              these live streams.
                           </SteppedDialog.Subtitle>
                        </Stack>

                        <Box sx={styles.actions}>
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
                              onClick={handleDelete}
                              loading={isDeleting}
                              sx={styles.actionBtn}
                           >
                              Yes, I&apos;m sure
                           </SteppedDialog.Button>
                        </Box>
                     </SteppedDialog.Content>
                  </>
               </SteppedDialog.Container>
            )}
         </JobFetchWrapper>
      </SuspenseWithBoundary>
   )
}

const renderDefaultVersion = () => (
   <Stack spacing={2} sx={styles.info}>
      <DeleteIcon color={"#FF4545"} size={48} />

      <SteppedDialog.Title sx={styles.title}>
         Delete job opening?
      </SteppedDialog.Title>

      <SteppedDialog.Subtitle sx={styles.subtitle}>
         Are you sure you want to delete this job opening? All data inserted and
         applicants’ details will be lost.
      </SteppedDialog.Subtitle>
   </Stack>
)
export default DeleteJobDialog
