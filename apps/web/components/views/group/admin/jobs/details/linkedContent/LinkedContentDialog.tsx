import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { SlideUpTransition } from "components/views/common/transitions"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { customJobRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback, useEffect, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { EditDialogState } from "."
import JobLinkLiveStreams from "../../dialog/createJob/JobLinkLiveStreams"
import JobLinkSparks from "../../dialog/createJob/JobLinkSparks"

const styles = sxStyles({
   dialog: {
      height: { xs: "auto", md: "auto" },
      maxHeight: { xs: "calc(90dvh)", md: "800px" },
      alignSelf: { xs: "self-end", md: "unset" },
      borderRadius: { xs: "20px 20px 0 0", md: 5 },
   },
})

type Props = {
   job: CustomJob
   dialogState: EditDialogState
   handleClose: () => void
}

const LinkedContentDialog = ({ job, dialogState, handleClose }: Props) => {
   const { group } = useGroup()
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { getValues, reset } = useFormContext()

   useEffect(() => {
      reset()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dialogState.open])

   const handleSubmit = useCallback(async () => {
      try {
         const { livestreamIds, sparkIds } = getValues()

         const updatedJob: CustomJob = {
            ...job,
            livestreams: livestreamIds ?? [],
            sparks: sparkIds ?? [],
         }

         await customJobRepo.updateCustomJob(updatedJob)
         successNotification("Job successfully updated")
      } catch (error) {
         errorNotification(error, "An error has occurred")
      } finally {
         handleClose()
      }
   }, [errorNotification, getValues, handleClose, job, successNotification])

   const views = useMemo(
      () =>
         getViews({
            job,
            handleSubmit,
            handleClose,
            hasNextStep: !dialogState.editMode && group.publicSparks,
         }),
      [job, handleSubmit, handleClose, dialogState.editMode, group.publicSparks]
   )

   return (
      <SteppedDialog
         key={dialogState.open ? "open" : "closed"}
         bgcolor="#FCFCFC"
         handleClose={handleClose}
         open={dialogState.open}
         views={views}
         initialStep={dialogState?.step || 0}
         transition={SlideUpTransition}
         sx={styles.dialog}
         fullWidth={false}
      />
   )
}

type ViewsProps = {
   job: CustomJob
   handleSubmit: () => void
   handleClose: () => void
   hasNextStep: boolean
}

const getViews = ({
   job,
   handleSubmit,
   handleClose,
   hasNextStep,
}: ViewsProps) => [
   {
      key: "live-streams",
      Component: () => (
         <SuspenseWithBoundary fallback={<></>}>
            <JobLinkLiveStreams
               job={job}
               handlePrimaryButton={hasNextStep ? null : handleSubmit}
               handleSecondaryButton={hasNextStep ? null : handleClose}
               primaryButtonMessage={hasNextStep ? "Next" : "Save"}
               secondaryButtonMessage={"Cancel"}
            />
         </SuspenseWithBoundary>
      ),
   },
   {
      key: "sparks",
      Component: () => (
         <SuspenseWithBoundary fallback={<></>}>
            <JobLinkSparks
               handlePrimaryButton={handleSubmit}
               handleSecondaryButton={hasNextStep ? null : handleClose}
               primaryButtonMessage={"Save"}
               secondaryButtonMessage={"Cancel"}
            />
         </SuspenseWithBoundary>
      ),
   },
]

export default LinkedContentDialog
