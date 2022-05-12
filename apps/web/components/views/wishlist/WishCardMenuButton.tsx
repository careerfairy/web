import React, { useMemo, useState } from "react"
import {
   IconButton,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
   SxProps,
} from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { StylesProps } from "../../../types/commonTypes"
import { DefaultTheme } from "@mui/styles"
import DeleteIcon from "@mui/icons-material/DeleteOutline"
import FlagIcon from "@mui/icons-material/FlagOutlined"
import EditIcon from "@mui/icons-material/Edit"
import { useAuth } from "../../../HOCs/AuthProvider"
import useDialog from "../../custom-hook/useDialog"
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal"
import { useDispatch } from "react-redux"
import * as actions from "../../../store/actions"
import FlagDialog from "./FlagDialog"
import wishRepo from "../../../data/firebase/WishRepository"
import { FlagReason } from "@careerfairy/shared-lib/dist/wishes"

const styles: StylesProps = {
   divider: {
      margin: "0px !important",
   },
   menuItem: {
      color: (theme) => `${theme.palette.common.black}  !important`,
      // borderBottom: (theme) =>
      //    `0.5px solid ${theme.palette.divider} !important`,
      // borderTop: (theme) => `0.5px solid ${theme.palette.divider} !important`,
   },
}

interface Props {
   sx?: SxProps<DefaultTheme>
   wishId: string
   authorUid: string
   handleDelete: () => Promise<void>
}

interface Option {
   label: string
   icon: React.ComponentType
   onClick: () => void
}

const WishCardMenuButton = ({ sx, wishId, authorUid, handleDelete }: Props) => {
   const [
      confirmDeleteModalOpen,
      handleOpenConfirmDeleteModal,
      handleCloseConfirmDeleteModal,
   ] = useDialog()
   const [flagModalOpen, handleOpenFlagModal, handleCloseFlagModal] =
      useDialog()
   const dispatch = useDispatch()
   const [deleting, setDeleting] = useState(false)
   const { isLoggedIn, authenticatedUser, userData } = useAuth()
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

   const handleClose = () => {
      setAnchorEl(null)
   }
   const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
   }

   const options = useMemo<Option[]>(() => {
      const options = []
      const isAuthor = Boolean(
         isLoggedIn && authenticatedUser.uid === authorUid
      )
      const isAdmin = Boolean(isLoggedIn && userData?.isAdmin)
      if (isAuthor || isAdmin) {
         options.push({
            label: "Edit",
            icon: <EditIcon />,
            onClick: () => {},
         })
         options.push({
            label: "Remove this wish",
            icon: <DeleteIcon />,
            onClick: handleOpenConfirmDeleteModal,
         })
      }
      if (isLoggedIn) {
         options.push({
            label: "Flag",
            icon: <FlagIcon />,
            onClick: handleOpenFlagModal,
         })
      }

      return options
   }, [wishId, authenticatedUser.uid, isLoggedIn, userData?.isAdmin])

   const handleDeleteWish = async () => {
      try {
         setDeleting(true)
         await handleDelete()
      } catch (error) {
         dispatch(actions.sendGeneralError(error))
      }
      setDeleting(false)
      handleCloseConfirmDeleteModal()
      handleClose()
   }
   const handleFlagWish = async (
      flagReasons: FlagReason[],
      message?: string
   ) => {
      try {
         setDeleting(true)
         await wishRepo.flagWish(wishId, flagReasons, message)
      } catch (error) {
         dispatch(actions.sendGeneralError(error))
      }
      setDeleting(false)
      handleCloseConfirmDeleteModal()
      handleClose()
   }

   if (!isLoggedIn) return null

   return (
      <>
         <IconButton
            onClick={handleClick}
            sx={[...(Array.isArray(sx) ? sx : [sx])]}
         >
            <MoreHorizIcon />
         </IconButton>
         <Menu
            id="wish-card-menu"
            MenuListProps={{
               "aria-labelledby": "wish-card-menu-button",
            }}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
         >
            {options.map((option) => (
               <MenuItem
                  key={option.label}
                  onClick={option.onClick}
                  sx={styles.menuItem}
               >
                  <ListItemIcon>{option.icon}</ListItemIcon>
                  <ListItemText primary={option.label} />
               </MenuItem>
            ))}
         </Menu>
         <AreYouSureModal
            handleClose={handleCloseConfirmDeleteModal}
            handleConfirm={handleDeleteWish}
            loading={deleting}
            title={"Are you sure you want to remove this wish?"}
            open={confirmDeleteModalOpen}
            confirmButtonText={"Delete this wish"}
         />
         <FlagDialog
            handleFlag={handleFlagWish}
            onClose={handleCloseFlagModal}
            open={flagModalOpen}
         />
      </>
   )
}

export default WishCardMenuButton
