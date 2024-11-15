import {
   Box,
   Divider,
   ListItemIcon,
   Menu,
   MenuItem,
   Stack,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { LineIcon } from "components/views/common/icons/LineIcon"
import { SlideUpTransition } from "components/views/common/transitions"
import { Fragment } from "react"
import { Edit2, MoreVertical, Trash2 } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   moreVerticalIcon: {
      color: (theme) => theme.palette.neutral[800],
      width: "20px",
      height: "20px",
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
   id: string
   editText: string
   deleteText: string
   handleEditClick: () => void
   handleDeleteClick: () => void
}

export const ProfileMoreDots = (props: ProfileMoreDotsOptions) => {
   const { id, editText, deleteText, handleEditClick, handleDeleteClick } =
      props

   const isMobile = useIsMobile()
   const { handleClick, open, handleClose, anchorEl } = useMenuState()

   return (
      <Fragment>
         <Box
            component={MoreVertical}
            sx={styles.moreVerticalIcon}
            onClick={handleClick}
         />
         <Menu
            anchorEl={isMobile ? null : anchorEl}
            id={id}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            TransitionComponent={isMobile ? SlideUpTransition : undefined}
            disableScrollLock={!isMobile}
            sx={[styles.menu, isMobile ? styles.mobileMenu : null]}
         >
            <ConditionalWrapper condition={isMobile}>
               <Stack alignItems={"center"}>
                  <LineIcon sx={{ width: "94px" }} />
               </Stack>
            </ConditionalWrapper>
            <Stack divider={<Divider sx={{ my: "0 !important" }} />}>
               <MenuItem sx={styles.menuItem} onClick={handleEditClick}>
                  <ListItemIcon sx={styles.listItemIcon}>
                     <Box component={Edit2} sx={styles.editIcon} />
                  </ListItemIcon>
                  <Typography color="neutral.600">{editText}</Typography>
               </MenuItem>

               <MenuItem sx={styles.menuItem} onClick={handleDeleteClick}>
                  <ListItemIcon sx={styles.listItemIcon}>
                     <Box component={Trash2} sx={styles.deleteIcon} />
                  </ListItemIcon>
                  <Typography color="error.600">{deleteText}</Typography>
               </MenuItem>
            </Stack>
         </Menu>
      </Fragment>
   )
}
