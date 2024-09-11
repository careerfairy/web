import {
   CustomJob,
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Dialog, DialogActions, DialogContent, SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJob from "components/custom-hook/custom-job/useCustomJob"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useUserJobApplication from "components/custom-hook/custom-job/useUserJobApplication"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import useGroupsByIds from "components/custom-hook/useGroupsByIds"
import useIsMobile from "components/custom-hook/useIsMobile"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import CustomJobCTAButtons from "components/views/jobs/components/custom-jobs/CustomJobCTAButtons"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
import CustomJobDetailsSkeleton from "components/views/jobs/components/custom-jobs/skeletons/CustomJobDetailsSkeleton"
import { ReactNode, useEffect } from "react"
import { useSelector } from "react-redux"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"
import { sxStyles } from "types/commonTypes"
import { SlideUpTransition } from "../transitions"

const styles = sxStyles({
   fixedBottomContent: {
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
   },
   jobApplyConfirmationDialog: {
      m: 2,
   },
   dialogContent: {
      p: 0,
      m: 0,
   },
   customJobDetailsView: { pt: "0px !important" },
})

type Props = {
   isOpen: boolean
   customJobId: string
   serverSideCustomJob?: CustomJob
   source?: CustomJobApplicationSource
   onClose?: () => void
   heroContent?: ReactNode
   heroSx?: SxProps<DefaultTheme>
}

const CustomJobDetailsDialog = (props: Props) => {
   const isMobile = useIsMobile()

   return (
      <Dialog
         maxWidth={"md"}
         scroll="paper"
         fullWidth
         fullScreen={isMobile}
         TransitionComponent={SlideUpTransition}
         open={props.isOpen}
         onClose={props.onClose}
      >
         {props.customJobId ? <DialogDetails {...props} /> : null}
      </Dialog>
   )
}

const DialogDetails = (props: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CustomJobDetailsSkeleton />}>
         <DialogDetailsContent {...props} />
      </SuspenseWithBoundary>
   )
}

const DialogDetailsContent = ({
   customJobId,
   serverSideCustomJob,
   source,
   heroContent,
   heroSx,
}: Props) => {
   const { userData } = useAuth()
   const { data: fingerPrintId } = useFingerPrint()

   const { applicationInitiatedOnly } = useUserJobApplication(
      userData?.id || fingerPrintId,
      customJobId
   )

   const hasInitialData =
      serverSideCustomJob && customJobId === serverSideCustomJob?.id

   const customJob = useCustomJob(
      customJobId,
      hasInitialData ? serverSideCustomJob : undefined
   )

   const [
      isApplyConfirmationOpen,
      handleConfirmationOpen,
      handleConfirmationClose,
   ] = useDialogStateHandler(false)

   useEffect(() => {
      if (applicationInitiatedOnly) handleConfirmationOpen()
   }, [applicationInitiatedOnly, handleConfirmationOpen])

   if (!customJob) return null

   return (
      <>
         <DialogContent sx={styles.dialogContent}>
            <Content
               customJob={customJob}
               source={source}
               heroContent={heroContent}
               heroSx={heroSx}
               showApplyConfirmation={isApplyConfirmationOpen}
               onApplyConfirmationClose={handleConfirmationClose}
            />
         </DialogContent>
         <DialogActions sx={styles.fixedBottomContent}>
            <Actions
               source={source}
               customJob={customJob}
               onApplyClick={handleConfirmationOpen}
            />
         </DialogActions>
      </>
   )
}

type ContentProps = Pick<Props, "source" | "heroContent" | "heroSx"> & {
   customJob: CustomJob
   showApplyConfirmation?: boolean
   onApplyConfirmationClose?: () => void
}

const Content = ({
   customJob,
   source,
   heroContent,
   heroSx,
   showApplyConfirmation,
   onApplyConfirmationClose,
}: ContentProps) => {
   const { applicationInitiatedOnly, handleConfirmApply } = useCustomJobApply(
      customJob as PublicCustomJob,
      source
   )

   const {
      data: [group],
   } = useGroupsByIds([customJob.groupId])

   const autoActionType = useSelector(autoAction)

   const isAutoApply = autoActionType === AutomaticActions.APPLY

   return (
      <>
         <CustomJobDetailsView
            job={customJob}
            heroContent={heroContent}
            applicationInitiatedOnly={applicationInitiatedOnly}
            heroSx={heroSx}
            sx={styles.customJobDetailsView}
            companyLogoUrl={group.logoUrl}
            companyName={group.universityName}
            hideCTAButtons
         />
         {showApplyConfirmation ? (
            <CustomJobApplyConfirmation
               handleClose={onApplyConfirmationClose}
               job={customJob as PublicCustomJob}
               applicationSource={source}
               autoApply={isAutoApply}
               onApply={handleConfirmApply}
               sx={styles.jobApplyConfirmationDialog}
            />
         ) : null}
      </>
   )
}

type ActionProps = Pick<Props, "source"> & {
   customJob: CustomJob
   onApplyClick?: () => void
}

const Actions = ({ source, customJob, onApplyClick }: ActionProps) => {
   const { handleClickApplyBtn, applicationInitiatedOnly } = useCustomJobApply(
      customJob as PublicCustomJob,
      source
   )
   const [, handleConfirmApplyOpen] = useDialogStateHandler(
      applicationInitiatedOnly
   )

   return (
      <CustomJobCTAButtons
         applicationSource={source}
         job={customJob as PublicCustomJob}
         handleApplyClick={() => {
            onApplyClick && onApplyClick()
            handleConfirmApplyOpen()
            handleClickApplyBtn()
         }}
      />
   )
}

export default CustomJobDetailsDialog
