import MoreVertIcon from "@mui/icons-material/MoreVert"
import { IconButton, MenuItem } from "@mui/material"
import Divider from "@mui/material/Divider"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useMenuState from "components/custom-hook/useMenuState"
import ConfirmDeleteSparkDialog from "components/views/admin/sparks/components/ConfirmDeleteSparkDialog"
import BrandedMenu from "components/views/common/inputs/BrandedMenu"
import { FC, Fragment, useCallback } from "react"
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
   groupId: string
}

const SparkOptionsButton: FC<Props> = ({ sparkId, groupId }) => {
   const dispatch = useDispatch()

   const { anchorEl, handleClick, handleClose, open } = useMenuState()
   const [confirmDialogOpen, handleOpenConfirm, handleCloseConfirm] =
      useDialogStateHandler()

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
         <ConfirmDeleteSparkDialog
            sparkId={sparkId}
            groupId={groupId}
            open={confirmDialogOpen}
            handleClose={handleCloseConfirm}
            onDeleted={handleCloseConfirm}
         />
      </Fragment>
   )
}

export default SparkOptionsButton
