import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { IconButton, MenuItem } from "@mui/material"
import Divider from "@mui/material/Divider"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedMenu from "components/views/common/inputs/BrandedMenu"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import { FC, Fragment, useCallback, useMemo } from "react"
import { useDispatch } from "react-redux"
import { openSparkDialog } from "store/reducers/adminSparksReducer"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "white",
      position: "absolute",
      right: 0,
      top: 8,
      "& svg": {
         fontSize: "2.285714286rem",
      },
   },
   deleteIcon: {
      fontSize: 60,
   },
   deleteMenuItem: {
      color: "error.main",
   },
})

type Props = {
   sparkId: string
}

const SparkOptionsButton: FC<Props> = ({ sparkId }) => {
   const dispatch = useDispatch()

   const { anchorEl, handleClick, handleClose, open } = useMenuState()
   const [confirmDialogOpen, handleOpenConfirm, handleCloseConfirm] =
      useDialogStateHandler()

   const primaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: () => {
            // TODO: Delete Spark
            handleCloseConfirm()
         },
         text: "Delete",
         color: "error",
         variant: "contained",
      }),
      [handleCloseConfirm]
   )

   const secondaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         callback: () => {
            handleCloseConfirm()
         },
         text: "Cancel",
         color: "grey",
         variant: "outlined",
      }),
      [handleCloseConfirm]
   )

   const handleClickDelete = useCallback(() => {
      handleOpenConfirm()
      handleClose()
   }, [handleClose, handleOpenConfirm])

   const handleClickEdit = useCallback(() => {
      dispatch(
         openSparkDialog({
            selectedSparkId: sparkId,
         })
      )
      handleClose()
   }, [dispatch, handleClose, sparkId])

   return (
      <Fragment>
         <IconButton onClick={handleClick} sx={styles.root} size="small">
            <MoreVertIcon />
         </IconButton>
         <BrandedMenu onClose={handleClose} anchorEl={anchorEl} open={open}>
            <MenuItem onClick={handleClickEdit}>Edit</MenuItem>
            <Divider />
            <MenuItem sx={styles.deleteMenuItem} onClick={handleClickDelete}>
               Delete Spark
            </MenuItem>
         </BrandedMenu>
         <ConfirmationDialog
            open={confirmDialogOpen}
            handleClose={handleCloseConfirm}
            icon={
               <DeleteForeverRoundedIcon color="error" sx={styles.deleteIcon} />
            }
            title="Delete Spark"
            description="Are you sure you want to delete this Spark? This action cannot be undone."
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
         />
      </Fragment>
   )
}

export default SparkOptionsButton
