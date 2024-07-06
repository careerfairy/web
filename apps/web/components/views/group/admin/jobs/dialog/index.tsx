import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { CircularProgress } from "@mui/material"
import JobFetchWrapper from "HOCs/job/JobFetchWrapper"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import dynamic from "next/dynamic"
import { MutableRefObject, useCallback, useMemo, useRef } from "react"
import { useFormContext } from "react-hook-form"
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
import SteppedDialog from "../../../../stepped-dialog/SteppedDialog"
import CustomJobFormProvider from "./CustomJobFormProvider"
import PrivacyPolicyDialog from "./additionalSteps/PrivacyPolicyDialog"
import JobFormDialog from "./createJob/JobFormDialog"
import DeleteJobDialog from "./deleteJob/DeleteJobDialog"

export type JobDialogStep = ReturnType<typeof getViews>[number]["key"]

export const JobDialogStep = {
   PRIVACY_POLICY: {
      position: 0,
      key: "privacy-policy",
   },
   OLD_FORM: {
      position: 1,
      key: "oldJobForm",
   },
   FORM_BASIC_INFO: {
      position: 1,
      key: "form-basic-info",
   },
   FORM_ADDITIONAL_DETAILS: {
      position: 2,
      key: "form-additional-details",
   },
   FORM_LINKED_LIVE_STREAMS: {
      position: 3,
      key: "form-linked-live-streams",
   },
   FORM_LINKED_SPARKS: {
      position: 4,
      key: "form-linked-content",
   },
   FORM_PREVIEW: {
      position: 5,
      key: "form-preview",
   },
   NO_LINKED_CONTENT: {
      position: 6,
      key: "no-linked-content",
   },
   DELETE_JOB: {
      position: 7,
      key: "delete-job",
   },
}

const styles = sxStyles({
   dialog: {
      top: { xs: "20dvh", md: 0 },
      borderRadius: 5,
   },
   smallDeleteDialog: {
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

type ViewsProps = {
   jobHubV1: boolean
   quillInputRef: any
   job?: CustomJob
}

// This function dynamically generates an array of views based on the jobHubV1 flag and the presence of a job.
const getViews = ({ jobHubV1, quillInputRef, job }: ViewsProps) =>
   [
      {
         key: "privacy-policy",
         Component: () => <PrivacyPolicyDialog />,
      },
      ...(jobHubV1
         ? [
              {
                 key: "form-basic-info",
                 Component: dynamic(() => import("./createJob/JobBasicInfo")),
              },
              {
                 key: "form-additional-details",
                 Component: () => (
                    <JobAdditionalDetails quillInputRef={quillInputRef} />
                 ),
              },
              {
                 key: "form-linked-live-streams",
                 Component: dynamic(
                    () => import("./createJob/JobLinkLiveStreams")
                 ),
              },
              {
                 key: "form-linked-content",
                 Component: dynamic(() => import("./createJob/JobLinkSparks")),
              },
              {
                 key: "form-preview",
                 Component: dynamic(() => import("./createJob/JobFormPreview")),
              },
           ]
         : [
              {
                 key: "oldJobForm",
                 Component: () => <JobFormDialog />,
              },
           ]),
      {
         key: "no-linked-content",
         Component: dynamic(
            () => import("./additionalSteps/NoLinkedContentDialog")
         ),
      },
      {
         key: "delete-job",
         Component: () => <DeleteJobDialog job={job} />,
      },
   ] as const

type Props = {
   afterCreateCustomJob?: (job: PublicCustomJob) => void
   afterUpdateCustomJob?: (job: PublicCustomJob) => void
}

const JobDialog = ({ afterCreateCustomJob, afterUpdateCustomJob }: Props) => {
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const quillInputRef = useRef()
   const dispatch = useDispatch()

   // This function is a default callback that closes the jobs dialog after the action has been completed
   const defaultAfterAction = useCallback(() => {
      dispatch(closeJobsDialog())
   }, [dispatch])

   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <JobFetchWrapper jobId={selectedJobId}>
            {(job) => (
               <CustomJobFormProvider
                  job={job}
                  quillInputRef={quillInputRef}
                  afterCreateCustomJob={
                     afterCreateCustomJob ?? defaultAfterAction
                  }
                  afterUpdateCustomJob={
                     afterUpdateCustomJob ?? defaultAfterAction
                  }
               >
                  <Content job={job} quillInputRef={quillInputRef} />
               </CustomJobFormProvider>
            )}
         </JobFetchWrapper>
      </SuspenseWithBoundary>
   )
}

type ContentProps = {
   job: CustomJob
   quillInputRef: MutableRefObject<any>
}

const Content = ({ job, quillInputRef }: ContentProps) => {
   const { group } = useGroupFromState()
   const dispatch = useDispatch()
   const isJobFormDialogOpen = useSelector(jobsDialogOpenSelector)
   const isDeleteJobDialogOpen = useSelector(deleteJobsDialogOpenSelector)
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const isDeleteJobDialogWithLinkedLivestreamsOpen = useSelector(
      deleteJobWithLinkedLivestreamsDialogOpenSelector
   )
   const { jobHubV1 } = useFeatureFlags()
   const { reset } = useFormContext()

   const handleCloseDialog = useCallback(() => {
      dispatch(closeJobsDialog())
      reset()
   }, [dispatch, reset])

   const initialStep = useMemo(() => {
      if (isDeleteJobDialogOpen) {
         return JobDialogStep.DELETE_JOB.position
      }

      return group.privacyPolicyActive || selectedJobId
         ? JobDialogStep.FORM_BASIC_INFO.position
         : JobDialogStep.PRIVACY_POLICY.position
   }, [group.privacyPolicyActive, isDeleteJobDialogOpen, selectedJobId])

   const views = useMemo(
      () => getViews({ jobHubV1, quillInputRef, job }),
      [job, jobHubV1, quillInputRef]
   )

   return (
      <SteppedDialog
         key={isJobFormDialogOpen || isDeleteJobDialogOpen ? "open" : "closed"}
         bgcolor="#FCFCFC"
         handleClose={handleCloseDialog}
         open={isJobFormDialogOpen || isDeleteJobDialogOpen}
         views={views}
         initialStep={initialStep}
         transition={SlideUpTransition}
         sx={[
            styles.dialog,
            isDeleteJobDialogOpen ? styles.smallDeleteDialog : null,
            isDeleteJobDialogWithLinkedLivestreamsOpen
               ? styles.jobWithList
               : null,
         ]}
      />
   )
}

export default JobDialog
