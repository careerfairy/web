import { sxStyles } from "@careerfairy/shared-ui"
import useIsMobile from "components/custom-hook/useIsMobile"
import BrandedDialog, { BrandedDialogProps } from "./BrandedDialog"
import RemoveQuestion from "./RemoveQuestion"

const styles = sxStyles({
   paper: {
      width: "414px",
      height: "300px",
   },
})

type FeedbackQuestionRemoveDialogProps = {
   handleRemoveClick: () => void
} & Omit<BrandedDialogProps, "children">

const FeedbackQuestionRemoveDialog = ({
   isDialogOpen,
   handleRemoveClick,
   handleCloseDialog,
}: FeedbackQuestionRemoveDialogProps) => {
   const isMobile = useIsMobile()

   return (
      <BrandedDialog
         isDialogOpen={isDialogOpen}
         handleCloseDialog={handleCloseDialog}
         paperSx={Boolean(!isMobile) && styles.paper}
      >
         <RemoveQuestion
            handleRemoveClick={handleRemoveClick}
            handleCancelClick={handleCloseDialog}
         />
      </BrandedDialog>
   )
}

export default FeedbackQuestionRemoveDialog
