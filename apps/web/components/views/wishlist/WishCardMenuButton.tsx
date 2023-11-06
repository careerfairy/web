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
import useDialogStateHandler from "../../custom-hook/useDialogStateHandler"
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal"
import { useDispatch } from "react-redux"
import * as actions from "../../../store/actions"
import FlagDialog from "./FlagDialog"
import { FlagReason, Wish } from "@careerfairy/shared-lib/dist/wishes"
import CreateOrEditWishDialog from "./CreateOrEditWishDialog"
import { Hit } from "../../../types/algolia"
import { Interest } from "@careerfairy/shared-lib/dist/interests"
import { wishlistRepo } from "../../../data/RepositoryInstances"

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
   handleDelete: () => Promise<void>
   wish: Hit<Wish>
   onUpdateWish: (newInterests: Interest[], newDescription: string) => void
}

interface Option {
   label: string
   icon: React.ComponentType
   onClick: () => void
}

const WishCardMenuButton = ({
   sx,
   handleDelete,
   wish,
   onUpdateWish,
}: Props) => {
   const [
      confirmDeleteModalOpen,
      handleOpenConfirmDeleteModal,
      handleCloseConfirmDeleteModal,
   ] = useDialogStateHandler()
   const [flagModalOpen, handleOpenFlagModal, handleCloseFlagModal] =
      useDialogStateHandler()
   const [
      editWishModalOpen,
      handleOpenEditWishModal,
      handleCloseEditWishModal,
   ] = useDialogStateHandler()
   const dispatch = useDispatch()
   const [deleting, setDeleting] = useState(false)
   const { isLoggedIn, authenticatedUser, userData } = useAuth()
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

   const handleClose = () => {
      if (flagModalOpen) handleCloseFlagModal()
      if (editWishModalOpen) handleCloseEditWishModal()
      if (confirmDeleteModalOpen) handleCloseConfirmDeleteModal()
      setAnchorEl(null)
   }
   const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
   }

   const options = useMemo<Option[]>(() => {
      const options = []
      const isAuthor = Boolean(
         isLoggedIn && authenticatedUser.uid === wish.authorUid
      )
      const isAdmin = Boolean(isLoggedIn && userData?.isAdmin)
      if (isAuthor || isAdmin) {
         options.push({
            label: "Edit",
            icon: <EditIcon />,
            onClick: handleOpenEditWishModal,
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
   }, [
      wish.id,
      wish.authorUid,
      authenticatedUser.uid,
      isLoggedIn,
      userData?.isAdmin,
   ])

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
         await wishlistRepo.flagWish(
            authenticatedUser.uid,
            authenticatedUser.email,
            wish.id,
            flagReasons,
            message
         )
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
                  <ListItemIcon>
                     {/* @ts-ignore */}
                     {option.icon}
                  </ListItemIcon>
                  <ListItemText primary={option.label} />
               </MenuItem>
            ))}
         </Menu>
         {confirmDeleteModalOpen && (
            <AreYouSureModal
               handleClose={handleClose}
               handleConfirm={handleDeleteWish}
               loading={deleting}
               title={"Are you sure you want to remove this wish?"}
               open={confirmDeleteModalOpen}
               confirmButtonText={"Delete this wish"}
            />
         )}
         {flagModalOpen && (
            <FlagDialog
               handleFlag={handleFlagWish}
               onClose={handleClose}
               open={flagModalOpen}
            />
         )}
         {editWishModalOpen && (
            <CreateOrEditWishDialog
               open={editWishModalOpen}
               onUpdateWish={onUpdateWish}
               wishToEdit={wish}
               onClose={handleClose}
            />
         )}
      </>
   )
}

export default WishCardMenuButton
