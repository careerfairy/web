import { useCallback, useMemo } from "react"
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
import NoLinkedContentDialog from "./additionalSteps/NoLinkedContentDialog"
import PrivacyPolicyDialog from "./additionalSteps/PrivacyPolicyDialog"
import JobBasicInfo from "./createJob/JobBasicInfo"
import JobFormDialog from "./createJob/JobFormDialog"
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

// This function dynamically generates an array of views based on the jobHubV1 flag and the presence of a job.
const getViews = (jobHubV1: boolean, quillInputRef, job?: CustomJob) =>
   [
      {
         key: "privacy-policy",
         Component: () => <PrivacyPolicyDialog />,
      },
      ...(jobHubV1
         ? [
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
           ]
         : [
              {
                 key: "oldJobForm",
                 Component: () => <JobFormDialog />,
              },
           ]),
      {
         key: "no-linked-content",
         Component: () => <NoLinkedContentDialog />,
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

   const handleCloseDialog = useCallback(() => {
      dispatch(closeJobsDialog())
   }, [dispatch])

   const initialStep = useMemo(() => {
      if (isDeleteJobDialogOpen) {
         return JobDialogStepEnum.DELETE_JOB
      }
      return group.privacyPolicyActive || selectedJobId
         ? JobDialogStepEnum.FORM_BASIC_INFO
         : JobDialogStepEnum.PRIVACY_POLICY
   }, [group.privacyPolicyActive, isDeleteJobDialogOpen, selectedJobId])

   const views = useMemo(
      () => getViews(jobHubV1, quillInputRef, job),
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
