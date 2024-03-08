import { FC } from "react"
import CreatorFormDialog from "./CreatorFormDialog"
import BrandedDialog, {
   BrandedDialogProps,
} from "../questions/components/BrandedDialog"
import { Creator } from "@careerfairy/shared-lib/groups/creators"

type FeedbackQuestionAddEditDialogProps = {
   creator?: Creator
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
