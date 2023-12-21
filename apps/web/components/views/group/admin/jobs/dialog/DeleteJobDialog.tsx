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
import { List, ListItem, Stack } from "@mui/material"
import useCustomJobDelete from "../../../../../custom-hook/custom-job/useCustomJobDelete"
import React, { FC, useCallback, useMemo } from "react"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { JobDialogStep } from "./index"
import useCustomJobLinkedLivestreams from "../../../../../custom-hook/custom-job/useCustomJobLinkedLivestreams"
import Typography from "@mui/material/Typography"

const styles = sxStyles({
   wrapContainer: {
      height: {
         xs: "100%",
         md: "100%",
      },
   },
   reducePadding: {
      px: { xs: 3, md: "28px !important" },
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
   },
   listWrapper: {
      width: "100%",
      px: 3,
      py: 2,
      my: 3,
      background: "#F6F6FA",
      borderRadius: "4px",
      listStyleType: "disc",
   },
   listItem: {
      display: "list-item",
      px: 0,
      mx: 2,
   },
   livestreamTitle: {
      fontSize: "16px",
      color: "#3D3D47",
   },
})

const DeleteJobDialog = () => {
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)

   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <JobFetchWrapper
            jobId={selectedJobId}
            shouldFetch={Boolean(selectedJobId)}
         >
            {(job) => <DeleteDialog job={job} />}
         </JobFetchWrapper>
      </SuspenseWithBoundary>
   )
}

type DeleteDialogProps = {
   job: CustomJob | null
}
const DeleteDialog: FC<DeleteDialogProps> = ({ job }) => {
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const { handleClose } = useStepper<JobDialogStep>()
   const { isDeleting, handleDelete } = useCustomJobDelete(selectedJobId)

   const hasLinkedLivestreams = useMemo(
      () => job?.livestreams?.length,
      [job?.livestreams?.length]
   )

   const handleJobDelete = useCallback(async () => {
      await handleDelete()
      handleClose()
   }, [handleClose, handleDelete])

   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <SteppedDialog.Container
            containerSx={styles.content}
            sx={[
               styles.wrapContainer,
               hasLinkedLivestreams ? styles.reducePadding : null,
            ]}
            hideCloseButton
            withActions
         >
            <>
               <SteppedDialog.Content sx={styles.container}>
                  <Stack spacing={3} sx={styles.info}>
                     {hasLinkedLivestreams ? (
                        <LinkedJobLivestreams job={job} />
                     ) : (
                        <>
                           <DeleteIcon color={"#FF4545"} size={48} />

                           <SteppedDialog.Title sx={styles.title}>
                              Delete job opening?
                           </SteppedDialog.Title>

                           <SteppedDialog.Subtitle sx={styles.subtitle}>
                              Are you sure you want to delete this job opening?
                              All data inserted and applicants’ details will be
                              lost.
                           </SteppedDialog.Subtitle>
                        </>
                     )}
                  </Stack>
               </SteppedDialog.Content>

               <SteppedDialog.Actions sx={styles.actions}>
                  <>
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
                        {hasLinkedLivestreams ? "Delete" : "Yes, I'm sure"}
                     </SteppedDialog.Button>
                  </>
               </SteppedDialog.Actions>
            </>
         </SteppedDialog.Container>
      </SuspenseWithBoundary>
   )
}

type LinkedJobLivestreamsProps = {
   job: CustomJob | null
}

const LinkedJobLivestreams: FC<LinkedJobLivestreamsProps> = ({ job }) => {
   const linkedLivestreams = useCustomJobLinkedLivestreams(job)

   const linkedLivestreamsToShow = linkedLivestreams.reduce(
      (acc, currentValue, index) => {
         if (index < 2 || (linkedLivestreams.length === 3 && index === 2)) {
            acc.push({
               id: currentValue.id,
               title: currentValue.title || "Draft livestream",
            })
         }

         if (linkedLivestreams.length > 3 && index === 2) {
            const additionalLivestreams = linkedLivestreams.length - 2

            acc.push({
               id: currentValue.id,
               title: `+${additionalLivestreams} additional live streams`,
            })
         }

         return acc
      },
      [] as { id: string; title: string }[]
   )

   return (
      <>
         <Radio color={"#FF4545"} size={48} />

         <SteppedDialog.Title sx={styles.title}>
            This job post is linked to the following upcoming live streams:
         </SteppedDialog.Title>

         <List sx={styles.listWrapper}>
            {linkedLivestreamsToShow.map((livestream) => (
               <ListItem key={livestream.id} sx={styles.listItem}>
                  <Typography sx={styles.livestreamTitle}>
                     {livestream.title}
                  </Typography>
               </ListItem>
            ))}
         </List>

         <SteppedDialog.Subtitle sx={styles.subtitle}>
            Deleting this job post will remove its links to these live streams.
         </SteppedDialog.Subtitle>
      </>
   )
}
export default DeleteJobDialog
