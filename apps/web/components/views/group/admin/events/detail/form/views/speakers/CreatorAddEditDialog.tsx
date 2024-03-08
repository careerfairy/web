import { FC } from "react"
import BrandedDialog, {
   BrandedDialogProps,
} from "../questions/components/BrandedDialog"
import CreatorFormDialog from "./CreatorFormDialog"
import { LivestreamCreator } from "../questions/commons"

type FeedbackQuestionAddEditDialogProps = {
   creator?: LivestreamCreator
} & Omit<BrandedDialogProps, "key" | "children">

const CreatorAddEditDialog: FC<FeedbackQuestionAddEditDialogProps> = ({
   creator,
   isDialogOpen,
   handleCloseDialog,
}) => (
   <BrandedDialog
      key="add-edit-creator-dialog"
      isDialogOpen={isDialogOpen}
      handleCloseDialog={handleCloseDialog}
   >
      <CreatorFormDialog creator={creator} handleClose={handleCloseDialog} />
   </BrandedDialog>
)

export default CreatorAddEditDialog
