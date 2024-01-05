import React, { FC, MouseEvent, useCallback } from "react"
import useMenuState from "../../../../custom-hook/useMenuState"
import { useDispatch } from "react-redux"
import {
   openDeleteJobDialogOpen,
   openJobsDialog,
} from "../../../../../store/reducers/adminJobsReducer"
import {
   Box,
   Dialog,
   Divider,
   IconButton,
   MenuItem,
   Typography,
} from "@mui/material"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import BrandedMenu from "../../../common/inputs/BrandedMenu"
import EditIcon from "@mui/icons-material/Edit"
import { Trash2 as DeleteIcon } from "react-feather"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { SlideUpTransition } from "../../../common/transitions"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"

const styles = sxStyles({
   editWrapper: {
      position: "absolute",
      right: { xs: "4px", md: "unset" },
   },
   menu: {
      "& .MuiPaper-root": {
         borderRadius: "6px",
      },
   },
   deleteMenuItem: {
      color: "error.main",
      py: "12px",
   },
   deleteIcon: {
      display: "flex",
      alignSelf: "center",
      height: "16px",
      width: "16px",
      mr: 2,

      "& svg": {
         height: 16,
      },
   },
   deleteMobileIcon: {
      mr: 2,
      width: 18,

      "& svg": {
         height: 18,
         width: 18,
      },
   },
   editMenuItem: {
      color: "#6B6B7F",
      px: "20px",
   },
   dialog: {
      top: { xs: "80dvh", md: 0 },
      borderRadius: 5,
   },
   container: {
      pt: "unset !important",
      px: "unset !important",
      mt: 1,
   },
   editLabelMobile: {
      ml: 1,
      fontSize: "16px",
   },
   lineWrapper: {
      display: "flex",
      mt: 1,
      justifyContent: "center",
   },
   line: {
      width: "92px",
   },
   optionDivider: {
      borderBottomWidth: "3px",
   },
})

type Props = {
   jobId: string
}
const JobMenu: FC<Props> = ({ jobId }) => {
   const { anchorEl, handleClick, handleClose, open } = useMenuState()
   const dispatch = useDispatch()
   const isMobile = useIsMobile()

   const handleRemoveJob = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         dispatch(openDeleteJobDialogOpen(jobId))
         handleClose()
      },
      [dispatch, handleClose, jobId]
   )

   const handleEditJob = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         dispatch(openJobsDialog(jobId))
         handleClose()
      },
      [dispatch, handleClose, jobId]
   )

   const menuClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         handleClick(event)
      },
      [handleClick]
   )

   const handleCloseMenu = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         handleClose()
      },
      [handleClose]
   )

   return (
      <Box sx={styles.editWrapper}>
         <IconButton onClick={menuClick} size={"small"}>
            <MoreVertIcon color={"secondary"} />
         </IconButton>
         {isMobile ? (
            <Dialog
               open={open}
               onClose={handleCloseMenu}
               TransitionComponent={SlideUpTransition}
               fullScreen
               PaperProps={{ sx: styles.dialog }}
            >
               <>
                  <Box sx={styles.lineWrapper}>
                     <Box sx={styles.line}>
                        <Divider
                           orientation={"horizontal"}
                           sx={styles.optionDivider}
                        />
                     </Box>
                  </Box>

                  <SteppedDialog.Container
                     hideCloseButton
                     sx={styles.container}
                  >
                     <SteppedDialog.Content>
                        <MenuItem
                           onClick={handleEditJob}
                           sx={styles.editMenuItem}
                        >
                           <EditIcon height={18} color="inherit" />
                           <Typography sx={styles.editLabelMobile}>
                              Edit job opening details
                           </Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem
                           sx={styles.deleteMenuItem}
                           onClick={handleRemoveJob}
                        >
                           <Box
                              sx={[styles.deleteIcon, styles.deleteMobileIcon]}
                           >
                              <DeleteIcon />
                           </Box>
                           <Typography fontSize={"16px"}>
                              Remove job opening
                           </Typography>
                        </MenuItem>
                     </SteppedDialog.Content>
                  </SteppedDialog.Container>
               </>
            </Dialog>
         ) : (
            <BrandedMenu
               onClose={handleCloseMenu}
               anchorEl={anchorEl}
               open={open}
               anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
               }}
               transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
               }}
               sx={styles.menu}
            >
               <MenuItem onClick={handleEditJob} color={"#6B6B7F"}>
                  <EditIcon height={16} color="inherit" />
                  Edit job opening details
               </MenuItem>
               <Divider />
               <MenuItem sx={styles.deleteMenuItem} onClick={handleRemoveJob}>
                  <Box sx={styles.deleteIcon}>
                     <DeleteIcon />
                  </Box>
                  Remove job opening
               </MenuItem>
            </BrandedMenu>
         )}
      </Box>
   )
}

export default JobMenu
