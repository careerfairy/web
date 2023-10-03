import { Delete } from "@mui/icons-material"
import {
   Box,
   IconButton,
   InputAdornment,
   Stack,
   Typography,
} from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import { useMemo } from "react"
import { Trash2 as DeleteIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { BrandedTextFieldField } from "../../../common/inputs/BrandedTextField"
import BaseStyles from "../BaseStyles"

const styles = sxStyles({
   root: {
      p: 2,
   },
   optionsLabel: {
      color: "rgba(95, 95, 95, 0.50)",
      fontSize: "1.14286rem",
   },
   optionValue: {
      color: "#5F5F5F",
      fontSize: "1.14286rem",
   },
})

type Props = {
   cardinal: number
   editing: boolean
   lastItem: boolean
   value: string
   name: string
   onDelete: () => void
   canDelete: boolean
   isInUse: boolean
}

const QuestionOption: React.FC<Props> = ({
   cardinal = 1,
   editing,
   lastItem,
   value,
   name,
   onDelete,
   canDelete,
   isInUse,
}) => {
   const [
      confirmDeleteOptionDialogOpen,
      handleOpenConfirmDeleteOptionDialogOpen,
      handleCloseConfirmDeleteOptionDialogOpen,
   ] = useDialogStateHandler()

   const handleClickDelete = () => {
      if (isInUse) {
         handleOpenConfirmDeleteOptionDialogOpen()
      } else {
         onDelete()
      }
   }

   const primaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         text: "Cancel",
         callback: handleCloseConfirmDeleteOptionDialogOpen,
         variant: "text",
         color: "grey",
      }),
      [handleCloseConfirmDeleteOptionDialogOpen]
   )

   const secondaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         text: "Delete",
         callback: () => {
            onDelete()
            handleCloseConfirmDeleteOptionDialogOpen()
         },
         variant: "contained",
         color: "error",
      }),
      [handleCloseConfirmDeleteOptionDialogOpen, onDelete]
   )

   return (
      <>
         {confirmDeleteOptionDialogOpen ? (
            <ConfirmationDialog
               open={confirmDeleteOptionDialogOpen}
               handleClose={handleCloseConfirmDeleteOptionDialogOpen}
               title={"Delete option"}
               description={`The option "${value}" is being used. If you delete it, it will be removed from all the associated questions.`}
               icon={
                  <Box sx={BaseStyles.deleteIcon}>
                     <DeleteIcon />
                  </Box>
               }
               primaryAction={primaryAction}
               secondaryAction={secondaryAction}
            />
         ) : null}
         {editing ? (
            <Box px={2} py={0.75}>
               <BrandedTextFieldField
                  label={`Question option ${cardinal ?? 1}`}
                  placeholder="Write an answer option"
                  name={name}
                  fullWidth
                  InputProps={{
                     endAdornment: canDelete ? (
                        <InputAdornment position="end">
                           <IconButton
                              aria-label="delete option"
                              onClick={handleClickDelete}
                              edge="end"
                              disabled={!canDelete}
                           >
                              <Delete />
                           </IconButton>
                        </InputAdornment>
                     ) : null,
                  }}
               />
            </Box>
         ) : (
            <Stack
               sx={[
                  styles.root,
                  {
                     borderBottom: lastItem ? "none" : "1px solid #EEE",
                  },
               ]}
               spacing={1}
            >
               <Typography sx={styles.optionsLabel}>
                  Option {cardinal}
               </Typography>
               <Typography sx={styles.optionValue}>{value}</Typography>
            </Stack>
         )}
      </>
   )
}

export default QuestionOption
