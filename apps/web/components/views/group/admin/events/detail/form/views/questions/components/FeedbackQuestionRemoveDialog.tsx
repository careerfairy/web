import { FC } from "react"
import RemoveQuestion from "./RemoveQuestion"
import { sxStyles } from "@careerfairy/shared-ui"
import useIsMobile from "components/custom-hook/useIsMobile"
import BrandedDialog, { BrandedDialogProps } from "./BrandedDialog"

const styles = sxStyles({
   paper: {
      width: "414px",
      height: "300px",
   },
   wrapContainer: {
      height: {
         xs: "320px",
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      my: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
   },
   title: {
      fontSize: { xs: "18px", md: "20px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   actions: {
      position: "absolute !important",
      width: "100%",
      display: "flex",
      justifyContent: "space-evenly",
      borderTop: "none !important",
      backgroundColor: "#FFFFFF !important",
   },
   cancelBtn: {
      color: "grey",
   },
   actionBtn: {
      width: "160px",
      height: "40px",
      boxShadow: "none",
   },
})

type FeedbackQuestionRemoveDialogProps = {
   question: object
} & Omit<BrandedDialogProps, "children">

const FeedbackQuestionRemoveDialog: FC<FeedbackQuestionRemoveDialogProps> = ({
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   question,
   isDialogOpen,
   handleCloseDialog,
}) => {
   const isMobile = useIsMobile()

   return (
      <BrandedDialog
         isDialogOpen={isDialogOpen}
         handleCloseDialog={handleCloseDialog}
         paperSx={Boolean(!isMobile) && styles.paper}
      >
         <RemoveQuestion handleCancelClick={handleCloseDialog} />
      </BrandedDialog>
   )
}

export default FeedbackQuestionRemoveDialog
