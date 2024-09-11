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
   title: {
      textTransform: "uppercase",
      fontWeight: "800",
   },
   body2: {
      fontSize: "1rem",
      mb: 3,
   },
   imageBox: {
      p: 0,
      "& img": {
         height: 50,
      },
   },
   titleBox: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   fixedBottomContent: {
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
   },

   jobApplyConfirmationDialog: {
      m: 2,
   },
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
   // const { userData } = useAuth()
   // const { data: fingerPrintId } = useFingerPrint()

   // const { applicationInitiatedOnly } = useUserJobApplication(
   //    userData?.id || fingerPrintId,
   //    customJobId
   // )

   // const [
   //    isApplyConfirmationOpen,
   //    handleConfirmationOpen,
   //    handleConfirmationClose,
   // ] = useDialogStateHandler(false)

   // useEffect(() => {
   //    if (applicationInitiatedOnly) handleConfirmationOpen()
   // }, [applicationInitiatedOnly, handleConfirmationOpen])

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

   const [
      isApplyConfirmationOpen,
      handleConfirmationOpen,
      handleConfirmationClose,
   ] = useDialogStateHandler(false)

   useEffect(() => {
      if (applicationInitiatedOnly) handleConfirmationOpen()
   }, [applicationInitiatedOnly, handleConfirmationOpen])

   return (
      <>
         <DialogContent
            sx={{
               p: 0,
               m: 0,
            }}
         >
            <Content
               serverSideCustomJob={serverSideCustomJob}
               customJobId={customJobId}
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
               serverSideCustomJob={serverSideCustomJob}
               customJobId={customJobId}
               onApplyClick={handleConfirmationOpen}
            />
         </DialogActions>
      </>
   )
}

type ContentProps = Pick<
   Props,
   "source" | "heroContent" | "heroSx" | "customJobId"
> & {
   serverSideCustomJob?: CustomJob
   showApplyConfirmation?: boolean
   onApplyConfirmationClose?: () => void
}

const Content = ({
   customJobId,
   serverSideCustomJob,
   source,
   heroContent,
   heroSx,
   showApplyConfirmation,
   onApplyConfirmationClose,
}: ContentProps) => {
   const hasInitialData =
      serverSideCustomJob && customJobId === serverSideCustomJob?.id

   const customJob = useCustomJob(
      customJobId,
      hasInitialData ? serverSideCustomJob : undefined
   )

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
            sx={{ pt: "0px !important" }}
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

type ActionProps = Pick<Props, "source" | "customJobId"> & {
   serverSideCustomJob?: CustomJob
   onApplyClick?: () => void
}

const Actions = ({
   source,
   serverSideCustomJob,
   customJobId,
   onApplyClick,
}: ActionProps) => {
   const hasInitialData =
      serverSideCustomJob && customJobId === serverSideCustomJob?.id

   const customJob = useCustomJob(
      customJobId,
      hasInitialData ? serverSideCustomJob : undefined
   )
   console.log("🚀 ~ Actions ~ customJob:", customJob)

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
