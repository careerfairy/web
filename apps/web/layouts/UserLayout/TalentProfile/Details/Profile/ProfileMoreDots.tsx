import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { Fragment } from "react"
import { Edit2, MoreVertical, Trash2 } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   moreVerticalIcon: {
      color: (theme) => theme.palette.neutral[800],
      width: "20px",
      height: "20px",
      minWidth: "20px !important",
      minHeight: "20px !important",
      "&:hover": {
         cursor: "pointer",
      },
   },
   menu: {
      mt: 1,
      "& .MuiList-root": {
         py: "0 !important",
      },
   },
   mobileMenu: {
      "& .MuiPaper-root": {
         left: "unset !important",
         top: "unset !important",
         right: "unset !important",
         bottom: "0",
         maxHeight: {
            xs: "120px",
            sm: "160px",
         },
         overflow: "hidden",
         width: "100dvw !important",
         maxWidth: "unset",
         borderBottomRightRadius: "0px",
         borderBottomLeftRadius: "0px",
      },
      "& .MuiBackdrop-root": {
         backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
      "& .MuiList-root": {
         height: "100dvh",
      },
   },
   menuItem: {
      p: "12px 16px",
   },
   listItemIcon: {
      minWidth: "26px !important",
   },
   editIcon: {
      color: (theme) => theme.palette.neutral[600],
      width: "16px",
      height: "16px",
   },
   deleteIcon: {
      color: (theme) => theme.brand.error[600],
      width: "16px",
      height: "16px",
   },
})

type ProfileMoreDotsOptions = {
   editText: string
   deleteText: string
   handleEditClick: () => void
   handleDeleteClick: () => void
}

export const ProfileMoreDots = (props: ProfileMoreDotsOptions) => {
   const { editText, deleteText, handleEditClick, handleDeleteClick } = props

   const isMobile = useIsMobile()
   const { handleClick, open, handleClose, anchorEl } = useMenuState()

   const options: MenuOption[] = [
      {
         label: editText,
         icon: <Box component={Edit2} sx={styles.editIcon} />,
         handleClick: handleEditClick,
         color: "neutral.600",
      },
      {
         label: deleteText,
         icon: <Box component={Trash2} sx={styles.deleteIcon} />,
         handleClick: handleDeleteClick,
         color: "error.600",
      },
   ]

   return (
      <Fragment>
         <Box
            component={MoreVertical}
            sx={styles.moreVerticalIcon}
            onClick={handleClick}
         />
         <BrandedResponsiveMenu
            options={options}
            open={open}
            anchorEl={isMobile ? null : anchorEl}
            handleClose={handleClose}
         />
      </Fragment>
   )
}
