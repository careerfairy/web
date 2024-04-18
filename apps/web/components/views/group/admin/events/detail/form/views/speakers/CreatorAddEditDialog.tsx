import { Creator } from "@careerfairy/shared-lib/groups/creators"
import BrandedDialog, {
   BrandedDialogProps,
} from "../questions/components/BrandedDialog"
import CreatorFormDialog from "./CreatorFormDialog"

type FeedbackQuestionAddEditDialogProps = {
   creator?: Creator
} & Omit<BrandedDialogProps, "children">

const CreatorAddEditDialog = ({
   creator,
   isDialogOpen,
   handleCloseDialog,
}: FeedbackQuestionAddEditDialogProps) => (
   <BrandedDialog
      isDialogOpen={isDialogOpen}
      handleCloseDialog={handleCloseDialog}
   >
      <CreatorFormDialog creator={creator} handleClose={handleCloseDialog} />
   </BrandedDialog>
)

export default CreatorAddEditDialog
