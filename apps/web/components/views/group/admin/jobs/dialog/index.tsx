import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { CircularProgress } from "@mui/material"
import JobFetchWrapper from "HOCs/job/JobFetchWrapper"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import dynamic from "next/dynamic"
import {
   MutableRefObject,
   useCallback,
   useEffect,
   useMemo,
   useRef,
} from "react"
import { useFormContext } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { closeJobsDialog } from "../../../../../../store/reducers/adminJobsReducer"
import {
   deleteJobsDialogOpenSelector,
   jobsDialogOpenSelector,
   jobsFormSelectedJobIdSelector,
} from "../../../../../../store/selectors/adminJobsSelectors"
import { sxStyles } from "../../../../../../types/commonTypes"
import useGroupFromState from "../../../../../custom-hook/useGroupFromState"
import { SlideUpTransition } from "../../../../common/transitions"
import SteppedDialog from "../../../../stepped-dialog/SteppedDialog"
import {
   CustomJobFormProvider,
   getInitialValues,
} from "./CustomJobFormProvider"
import NoContentAvailableDialog from "./additionalSteps/NoContentAvailableDialog"
import NoLinkedContentDialog from "./additionalSteps/NoLinkedContentDialog"
import PrivacyPolicyDialog from "./additionalSteps/PrivacyPolicyDialog"
import JobBasicInfo from "./createJob/JobBasicInfo"
import JobFormPreview from "./createJob/JobFormPreview"
import JobLinkLiveStreams from "./createJob/JobLinkLiveStreams"
import JobLinkSkeleton from "./createJob/JobLinkSkeleton"
import JobLinkSparks from "./createJob/JobLinkSparks"
import DeleteJobDialog from "./deleteJob/DeleteJobDialog"

export type JobDialogStep = ReturnType<typeof getViews>[number]["key"]

export const JobDialogStep = {
   PRIVACY_POLICY: {
      position: 0,
      key: "privacy-policy",
   },
   DELETE_JOB: {
      position: 1,
      key: "delete-job",
   },
   NO_CONTENT_AVAILABLE: {
      position: 2,
      key: "no-content-available",
   },
   FORM_BASIC_INFO: {
      position: 3,
      key: "form-basic-info",
   },
   FORM_ADDITIONAL_DETAILS: {
      position: 4,
      key: "form-additional-details",
   },
   FORM_LINKED_LIVE_STREAMS: {
      position: 5,
      key: "form-linked-live-streams",
   },
   FORM_LINKED_SPARKS: {
      position: 6,
      key: "form-linked-sparks-content",
   },
   NO_LINKED_CONTENT: {
      position: 7,
      key: "no-linked-content",
   },
   FORM_PREVIEW: {
      position: 8,
      key: "form-preview",
   },
}

const styles = sxStyles({
   dialog: {
      height: { xs: "auto", md: "auto" },
      maxHeight: { xs: "calc(90dvh)", md: "800px" },
      alignSelf: { xs: "self-end", md: "unset" },
      borderRadius: { xs: "20px 20px 0 0", md: 5 },
   },
})

const JobAdditionalDetails = dynamic(
   () => import("./createJob/JobAdditionalDetails"),
   {
      ssr: false,
   }
)

type ViewsProps = {
   quillInputRef: any
   job?: CustomJob
}

const getViews = ({ quillInputRef, job }: ViewsProps) =>
   [
      {
         key: JobDialogStep.PRIVACY_POLICY.key,
         Component: () => <PrivacyPolicyDialog />,
      },
      {
         key: JobDialogStep.DELETE_JOB.key,
         Component: () => <DeleteJobDialog job={job} />,
      },
      {
         key: JobDialogStep.NO_CONTENT_AVAILABLE.key,
         Component: () => <NoContentAvailableDialog />,
      },
      {
         key: JobDialogStep.FORM_BASIC_INFO.key,
         Component: () => <JobBasicInfo />,
      },
      {
         key: JobDialogStep.FORM_ADDITIONAL_DETAILS.key,
         Component: () => (
            <JobAdditionalDetails quillInputRef={quillInputRef} />
         ),
      },
      {
         key: JobDialogStep.FORM_LINKED_LIVE_STREAMS.key,
         Component: () => (
            <SuspenseWithBoundary fallback={<JobLinkSkeleton />}>
               <JobLinkLiveStreams job={job} />
            </SuspenseWithBoundary>
         ),
      },
      {
         key: JobDialogStep.FORM_LINKED_SPARKS.key,
         Component: () => (
            <SuspenseWithBoundary fallback={<JobLinkSkeleton />}>
               <JobLinkSparks />
            </SuspenseWithBoundary>
         ),
      },
      {
         key: JobDialogStep.NO_LINKED_CONTENT.key,
         Component: () => <NoLinkedContentDialog />,
      },
      {
         key: JobDialogStep.FORM_PREVIEW.key,
         Component: () => (
            <SuspenseWithBoundary fallback={<></>}>
               <JobFormPreview />
            </SuspenseWithBoundary>
         ),
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
   const { reset } = useFormContext()

   useEffect(() => {
      const updatedDefaultValues = getInitialValues(job, group)
      reset(updatedDefaultValues)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isJobFormDialogOpen])

   const handleCloseDialog = useCallback(() => {
      dispatch(closeJobsDialog())
   }, [dispatch])

   const initialStep = useMemo(() => {
      if (isDeleteJobDialogOpen) {
         return JobDialogStep.DELETE_JOB.position
      }

      return group.privacyPolicyActive || selectedJobId
         ? JobDialogStep.FORM_BASIC_INFO.position
         : JobDialogStep.PRIVACY_POLICY.position
   }, [group.privacyPolicyActive, isDeleteJobDialogOpen, selectedJobId])

   const views = useMemo(
      () => getViews({ quillInputRef, job }),
      [job, quillInputRef]
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
         sx={styles.dialog}
         fullWidth={false}
      />
   )
}

export default JobDialog
