// import {
//     CustomJob,
//     PublicCustomJob,
//  } from "@careerfairy/shared-lib/customJobs/customJobs"
//  import { CircularProgress } from "@mui/material"
//  import JobFetchWrapper from "HOCs/job/JobFetchWrapper"
//  import { SuspenseWithBoundary } from "components/ErrorBoundary"
//  import dynamic from "next/dynamic"
//  import {
//     MutableRefObject,
//     useCallback,
//     useEffect,
//     useMemo,
//     useRef,
//  } from "react"
//  import { useFormContext } from "react-hook-form"
//  import { useDispatch, useSelector } from "react-redux"
//  import { closeJobsDialog } from "../../../../../../store/reducers/adminJobsReducer"
//  import {
//     deleteJobsDialogOpenSelector,
//     jobsDialogOpenSelector,
//     jobsFormSelectedJobIdSelector,
//  } from "../../../../../../store/selectors/adminJobsSelectors"
//  import { sxStyles } from "../../../../../../types/commonTypes"
//  import useGroupFromState from "../../../../../custom-hook/useGroupFromState"
//  import { SlideUpTransition } from "../../../../common/transitions"
//  import SteppedDialog from "../../../../stepped-dialog/SteppedDialog"
//  import {
//     CustomJobFormProvider,
//     getInitialValues,
//  } from "./CustomJobFormProvider"
//  import NoContentAvailableDialog from "./additionalSteps/NoContentAvailableDialog"
//  import NoLinkedContentDialog from "./additionalSteps/NoLinkedContentDialog"
//  import PrivacyPolicyDialog from "./additionalSteps/PrivacyPolicyDialog"
//  import JobBasicInfo from "./createJob/JobBasicInfo"
//  import JobFormPreview from "./createJob/JobFormPreview"
//  import JobLinkLiveStreams from "./createJob/JobLinkLiveStreams"
//  import JobLinkSkeleton from "./createJob/JobLinkSkeleton"
//  import JobLinkSparks from "./createJob/JobLinkSparks"
//  import DeleteJobDialog from "./deleteJob/DeleteJobDialog"
// import { StudyBackground } from "@careerfairy/shared-lib/users"

//  export type StudyBackgroundDialogStep = ReturnType<typeof getViews>[number]["key"]

//  export const StudyBackgroundDialogStep = {
//     STUDY_BACKGROUND_BASIC_INFO: {
//        position: 0,
//        key: "study-background-form-basic-info",
//     }
//  }

//  const styles = sxStyles({
//     dialog: {
//        height: { xs: "auto", md: "auto" },
//        maxHeight: { xs: "calc(90dvh)", md: "800px" },
//        alignSelf: { xs: "self-end", md: "unset" },
//        borderRadius: { xs: "20px 20px 0 0", md: 5 },
//     },
//  })

//  const getViews = ( ) =>
//     [
//        {
//           key: StudyBackgroundDialogStep.STUDY_BACKGROUND_BASIC_INFO.key,
//           Component: () => <JobBasicInfo />,
//        }
//     ] as const

//  type Props = {
//     afterCreateStudyBackground?: (studyBackground: StudyBackground) => void
//     afterUpdateStudyBackground?: (studyBackground: StudyBackground) => void
//  }

//  const StudyBackgroundDialog = ({ afterCreateStudyBackground, afterUpdateStudyBackground }: Props) => {
//     const quillInputRef = useRef()
//     const dispatch = useDispatch()

//     // This function is a default callback that closes the jobs dialog after the action has been completed
//     const defaultAfterAction = useCallback(() => {
//        dispatch(closeJobsDialog())
//     }, [dispatch])

//     return (
//        <SuspenseWithBoundary fallback={<CircularProgress />}>
//           <CustomJobFormProvider
//                    job={job}
//                    quillInputRef={quillInputRef}
//                    afterCreateCustomJob={
//                       afterCreateCustomJob ?? defaultAfterAction
//                    }
//                    afterUpdateCustomJob={
//                       afterUpdateCustomJob ?? defaultAfterAction
//                    }
//                 >
//                    <Content />
//                 </CustomJobFormProvider>
//        </SuspenseWithBoundary>
//     )
//  }

//  const Content = ( ) => {
//     const dispatch = useDispatch()
//     const isStudyBackgroundDialogOpen = useSelector(jobsDialogOpenSelector)

//     const handleCloseDialog = useCallback(() => {
//        dispatch(closeJobsDialog())
//     }, [dispatch])

//     const views = getViews( )

//     return (
//        <SteppedDialog
//           key={isStudyBackgroundDialogOpen ? "open" : "closed"}
//           bgcolor="#FCFCFC"
//           handleClose={handleCloseDialog}
//           open={isStudyBackgroundDialogOpen }
//           views={views}
//           initialStep={StudyBackgroundDialogStep.STUDY_BACKGROUND_BASIC_INFO.position}
//           transition={SlideUpTransition}
//           sx={styles.dialog}
//           fullWidth={false}
//        />
//     )
//  }

//  export default StudyBackgroundDialog
