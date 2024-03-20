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
