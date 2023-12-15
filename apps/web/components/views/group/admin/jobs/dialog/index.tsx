import React, { useCallback, useMemo } from "react"
import SteppedDialog, {
   useStepper,
} from "../../../../stepped-dialog/SteppedDialog"
import { useDispatch, useSelector } from "react-redux"
import {
   deleteJobsDialogOpenSelector,
   jobsDialogOpenSelector,
   jobsFormSelectedJobIdSelector,
} from "../../../../../../store/selectors/adminJobsSelectors"
import { closeJobsDialog } from "../../../../../../store/reducers/adminJobsReducer"
import useGroupFromState from "../../../../../custom-hook/useGroupFromState"
import { SlideUpTransition } from "../../../../common/transitions"
import { sxStyles } from "../../../../../../types/commonTypes"
import PrivacyPolicyDialog from "./PrivacyPolicyDialog"
import JobFormDialog from "./JobFormDialog"
import DeleteJobDialog from "./DeleteJobDialog"

const styles = sxStyles({
   dialog: {
      top: { xs: "70px", md: 0 },
      borderRadius: 5,
   },
   smallDialog: {
      maxWidth: 450,
   },
})
const views = [
   {
      key: "privacy-policy",
      Component: () => <PrivacyPolicyDialog />,
   },
   {
      key: "create-form",
      Component: () => <JobFormDialog />,
   },
   {
      key: "delete-job",
      Component: () => <DeleteJobDialog />,
   },
] as const

export type JobDialogStep = (typeof views)[number]["key"]

enum JobDialogStepEnum {
   PRIVACY_POLICY = 0,
   FORM = 1,
   DELETE_JOB = 2,
}

const JobDialog = () => {
   const { handleClose } = useStepper<JobDialogStep>()
   const { group } = useGroupFromState()
   const dispatch = useDispatch()
   const isJobFormDialogOpen = useSelector(jobsDialogOpenSelector)
   const isDeleteJobDialogOpen = useSelector(deleteJobsDialogOpenSelector)
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)

   const handleCloseDialog = useCallback(() => {
      dispatch(closeJobsDialog())
      handleClose()
   }, [dispatch, handleClose])

   const currentStep = useMemo(() => {
      if (isDeleteJobDialogOpen) {
         return JobDialogStepEnum.DELETE_JOB
      }
      return group.privacyPolicyActive || selectedJobId
         ? JobDialogStepEnum.FORM
         : JobDialogStepEnum.PRIVACY_POLICY
   }, [group.privacyPolicyActive, isDeleteJobDialogOpen, selectedJobId])

   return (
      <SteppedDialog
         key={isJobFormDialogOpen || isDeleteJobDialogOpen ? "open" : "closed"}
         bgcolor="#FCFCFC"
         handleClose={handleCloseDialog}
         open={isJobFormDialogOpen || isDeleteJobDialogOpen}
         views={views}
         initialStep={currentStep}
         transition={SlideUpTransition}
         sx={[styles.dialog, isDeleteJobDialogOpen ? styles.smallDialog : null]}
      />
   )
}

export default JobDialog
