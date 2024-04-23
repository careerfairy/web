import { FeedbackQuestionFormValues } from "../commons"
import BrandedDialog, { BrandedDialogProps } from "./BrandedDialog"
import FeedbackQuestionFormDialog from "./FeedbackQuestionFormDialog"

type FeedbackQuestionAddEditDialogProps = {
   question?: FeedbackQuestionFormValues
} & Omit<BrandedDialogProps, "children">

const FeedbackQuestionAddEditDialog = ({
   question,
   isDialogOpen,
   handleCloseDialog,
}: FeedbackQuestionAddEditDialogProps) => (
   <BrandedDialog
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
