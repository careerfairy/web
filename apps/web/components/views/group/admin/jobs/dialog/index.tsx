import dynamic from "next/dynamic"
import React, { useCallback, useMemo } from "react"
import SteppedDialog, {
   useStepper,
} from "../../../../stepped-dialog/SteppedDialog"
import { useDispatch, useSelector } from "react-redux"
import {
   jobsDialogOpenSelector,
   jobsFormSelectedJobIdSelector,
} from "../../../../../../store/selectors/adminJobsSelectors"
import { closeJobsDialog } from "../../../../../../store/reducers/adminJobsReducer"
import useGroupFromState from "../../../../../custom-hook/useGroupFromState"
import { SlideUpTransition } from "../../../../common/transitions"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   dialog: {
      top: { xs: "70px", md: 0 },
      borderRadius: 5,
   },
})
const views = [
   {
      key: "privacy-policy",
      Component: dynamic(() => import("./PrivacyPolicyDialog")),
   },
   {
      key: "create-form",
      Component: dynamic(() => import("./JobFormDialog")),
   },
]

export type JobDialogStep = (typeof views)[number]["key"]

const JobDialog = () => {
   const { handleClose } = useStepper<JobDialogStep>()
   const { group } = useGroupFromState()
   const dispatch = useDispatch()
   const isOpen = useSelector(jobsDialogOpenSelector)
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)

   const handleCloseDialog = useCallback(() => {
      dispatch(closeJobsDialog())
      handleClose()
   }, [dispatch, handleClose])

   const currentStep = useMemo(
      () => (group.privacyPolicyActive || selectedJobId ? 1 : 0),
      [group.privacyPolicyActive, selectedJobId]
   )

   return (
      <SteppedDialog
         key={isOpen ? "open" : "closed"}
         bgcolor="#FCFCFC"
         handleClose={handleCloseDialog}
         open={isOpen}
         views={views}
         initialStep={currentStep}
         transition={SlideUpTransition}
         sx={styles.dialog}
      />
   )
}

export default JobDialog
