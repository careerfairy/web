import {
   CustomJob,
   JobApplicationContext,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Dialog, DialogActions, DialogContent, SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useGroupsByIds from "components/custom-hook/useGroupsByIds"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import CustomJobApplyConfirmation from "components/views/jobs/components/custom-jobs/CustomJobApplyConfirmation"
import CustomJobCTAButtons from "components/views/jobs/components/custom-jobs/CustomJobCTAButtons"
import CustomJobDetailsView from "components/views/jobs/components/custom-jobs/CustomJobDetailsView"
import { ReactNode } from "react"
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
   customJob: CustomJob
   context?: JobApplicationContext
   onClose?: () => void
   heroContent?: ReactNode
   heroSx?: SxProps<DefaultTheme>
}

const CustomJobDetailsDialog = ({
   isOpen,
   customJob,
   context,
   onClose,
   heroContent,
   heroSx,
}: Props) => {
   const isMobile = useIsMobile()

   return (
      <Dialog
         maxWidth={"md"}
         scroll="paper"
         fullWidth
         fullScreen={isMobile}
         TransitionComponent={SlideUpTransition}
         open={isOpen}
         onClose={onClose}
      >
         <DialogContent
            sx={{
               p: 0,
               m: 0,
            }}
         >
            <ConditionalWrapper condition={Boolean(customJob)}>
               <Content
                  customJob={customJob}
                  context={context}
                  heroContent={heroContent}
                  heroSx={heroSx}
               />
            </ConditionalWrapper>
         </DialogContent>
         <DialogActions sx={styles.fixedBottomContent}>
            <ConditionalWrapper condition={Boolean(customJob)}>
               <Actions context={context} customJob={customJob} />
            </ConditionalWrapper>
         </DialogActions>
      </Dialog>
   )
}

type ContentProps = Pick<
   Props,
   "customJob" | "context" | "heroContent" | "heroSx"
>

const Content = ({ customJob, context, heroContent, heroSx }: ContentProps) => {
   const { applicationInitiatedOnly, handleConfirmApply } = useCustomJobApply(
      customJob as PublicCustomJob,
      context
   )
   const [isConfirmApplyOpened, handleConfirmApplyClose] =
      useDialogStateHandler(applicationInitiatedOnly)

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
         {isConfirmApplyOpened ? (
            <CustomJobApplyConfirmation
               handleClose={handleConfirmApplyClose}
               job={customJob as PublicCustomJob}
               applicationContext={context}
               autoApply={isAutoApply}
               onApply={() => {
                  handleConfirmApplyClose()
                  handleConfirmApply
               }}
               sx={styles.jobApplyConfirmationDialog}
            />
         ) : null}
      </>
   )
}

type ActionProps = Pick<Props, "customJob" | "context">

const Actions = ({ context, customJob }: ActionProps) => {
   const { handleClickApplyBtn, applicationInitiatedOnly } = useCustomJobApply(
      customJob as PublicCustomJob,
      context
   )
   const [, handleConfirmApplyOpen] = useDialogStateHandler(
      applicationInitiatedOnly
   )

   return (
      <CustomJobCTAButtons
         applicationContext={context}
         job={customJob as PublicCustomJob}
         handleApplyClick={() => {
            handleConfirmApplyOpen()
            handleClickApplyBtn()
         }}
      />
   )
}

export default CustomJobDetailsDialog
