import { FC } from "react"
import FeedbackQuestionFormDialog from "./FeedbackQuestionFormDialog"
import BrandedDialog, { BrandedDialogProps } from "./BrandedDialog"
import { FeedbackQuestionFormValues } from "../commons"

type FeedbackQuestionAddEditDialogProps = {
   question?: FeedbackQuestionFormValues
} & Omit<BrandedDialogProps, "key" | "children">

const FeedbackQuestionAddEditDialog: FC<FeedbackQuestionAddEditDialogProps> = ({
   question,
   isDialogOpen,
   handleCloseDialog,
}) => (
   <BrandedDialog
      key="add-edit-feedback-question-dialog"
      isDialogOpen={isDialogOpen}
      handleCloseDialog={handleCloseDialog}
   >
      <FeedbackQuestionFormDialog
         question={question}
         handleClose={handleCloseDialog}
      />
   </BrandedDialog>
)

export default FeedbackQuestionAddEditDialog
