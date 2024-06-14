import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { CircularProgress } from "@mui/material"
import JobFetchWrapper from "HOCs/job/JobFetchWrapper"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import dynamic from "next/dynamic"
import { useCallback, useMemo, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { closeJobsDialog } from "../../../../../../store/reducers/adminJobsReducer"
import {
   deleteJobWithLinkedLivestreamsDialogOpenSelector,
   deleteJobsDialogOpenSelector,
   jobsDialogOpenSelector,
   jobsFormSelectedJobIdSelector,
} from "../../../../../../store/selectors/adminJobsSelectors"
import { sxStyles } from "../../../../../../types/commonTypes"
import useGroupFromState from "../../../../../custom-hook/useGroupFromState"
import { SlideUpTransition } from "../../../../common/transitions"
import SteppedDialog, {
   useStepper,
} from "../../../../stepped-dialog/SteppedDialog"
import JobFormikProvider from "./CustomJobFormikProvider"
import NoLinkedContentDialog from "./additionalSteps/NoLinkedContentDialog"
import PrivacyPolicyDialog from "./additionalSteps/PrivacyPolicyDialog"
import JobBasicInfo from "./createJob/JobBasicInfo"
import DeleteJobDialog from "./deleteJob/DeleteJobDialog"

export type JobDialogStep = ReturnType<typeof getViews>[number]["key"]

export enum JobDialogStepEnum {
   PRIVACY_POLICY = 0,
   FORM_BASIC_INFO = 1,
   FORM_ADDITIONAL_DETAILS = 2,
   NO_LINKED_CONTENT = 3,
   DELETE_JOB = 4,
}

const styles = sxStyles({
   dialog: {
      top: { xs: "70px", md: 0 },
      borderRadius: 5,
   },
   smallDialog: {
      maxWidth: { md: 450 },
      top: { xs: "calc(100dvh - 320px)", md: 0 },
   },
   jobWithList: {
      top: { xs: "calc(100dvh - 500px)", md: 0 },
   },
})

// Due to the quillInputRef field
const JobAdditionalDetails = dynamic(
   () => import("./createJob/JobAdditionalDetails"),
   {
      ssr: false,
   }
)

const getViews = (quillInputRef, job?: CustomJob) =>
   [
      {
         key: "privacy-policy",
         Component: () => <PrivacyPolicyDialog />,
      },
      {
         key: "create-job-basic-info",
         Component: () => <JobBasicInfo />,
      },
      {
         key: "create-job-additional-details",
         Component: () => (
            <JobAdditionalDetails quillInputRef={quillInputRef} />
         ),
      },
      {
         key: "no-linked-content",
         Component: () => <NoLinkedContentDialog />,
      },
      {
         key: "delete-job",
         Component: () => <DeleteJobDialog job={job} />,
      },
   ] as const

const JobDialog = () => {
   const { handleClose } = useStepper<JobDialogStep>()
   const { group } = useGroupFromState()
   const dispatch = useDispatch()
   const isJobFormDialogOpen = useSelector(jobsDialogOpenSelector)
   const isDeleteJobDialogOpen = useSelector(deleteJobsDialogOpenSelector)
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const isDeleteJobDialogWithLinkedLivestreamsOpen = useSelector(
      deleteJobWithLinkedLivestreamsDialogOpenSelector
   )
   const quillInputRef = useRef()

   const handleCloseDialog = useCallback(() => {
      dispatch(closeJobsDialog())
      handleClose()
   }, [dispatch, handleClose])

   const currentStep = useMemo(() => {
      if (isDeleteJobDialogOpen) {
         return JobDialogStepEnum.DELETE_JOB
      }
      return group.privacyPolicyActive || selectedJobId
         ? JobDialogStepEnum.FORM_BASIC_INFO
         : JobDialogStepEnum.PRIVACY_POLICY
   }, [group.privacyPolicyActive, isDeleteJobDialogOpen, selectedJobId])

   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <JobFetchWrapper jobId={selectedJobId}>
            {(job) => (
               <JobFormikProvider job={job} quillInputRef={quillInputRef}>
                  <SteppedDialog
                     key={
                        isJobFormDialogOpen || isDeleteJobDialogOpen
                           ? "open"
                           : "closed"
                     }
                     bgcolor="#FCFCFC"
                     handleClose={handleCloseDialog}
                     open={isJobFormDialogOpen || isDeleteJobDialogOpen}
                     views={getViews(quillInputRef, job)}
                     initialStep={currentStep}
                     transition={SlideUpTransition}
                     sx={[
                        styles.dialog,
                        isDeleteJobDialogOpen ? styles.smallDialog : null,
                        isDeleteJobDialogWithLinkedLivestreamsOpen
                           ? styles.jobWithList
                           : null,
                     ]}
                  />
               </JobFormikProvider>
            )}
         </JobFetchWrapper>
      </SuspenseWithBoundary>
   )
}

export default JobDialog
