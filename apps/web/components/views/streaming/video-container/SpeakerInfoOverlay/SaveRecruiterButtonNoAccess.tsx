import React from "react"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { Button, Popover, Typography } from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import IconButton from "@mui/material/IconButton"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Link from "../../../common/Link"
import { useAuth } from "../../../../../HOCs/AuthProvider"

export const SaveRecruiterButtonNoAccess = () => {
   const [anchorEl, setAnchorEl] = React.useState(null)
   const { isLoggedOut } = useAuth()
   const [timeout, setTimeoutValue] = React.useState(null)

   const isMobile = useIsMobile()

   const requiredBadge = UserPresenter.saveRecruitersRequiredBadge()

   const openProfilePage = () => {
      const win = window.open("/profile", "_blank")
      win.focus()
   }

   let popoverContent = (
      <Typography sx={{ p: 1 }}>
         You have to unlock the{" "}
         <Link href="#" onClick={openProfilePage}>
            {requiredBadge.name} Badge
         </Link>{" "}
         to access this feature.
      </Typography>
   )

   if (isLoggedOut) {
      popoverContent = (
         <Typography sx={{ p: 1 }}>
            You must be logged in to save a speaker.
         </Typography>
      )
   }

   const handlePopoverOpen = (event) => {
      if (timeout) {
         clearTimeout(timeout)
      }
      setAnchorEl(event.currentTarget)
   }

   const handlePopoverClose = () => {
      // give some time for the user to click on the link
      setTimeoutValue(
         setTimeout(() => {
            setAnchorEl(null)
         }, 1000)
      )
   }

   const open = Boolean(anchorEl)

   return (
      <>
         <Button variant="contained" startIcon={<SaveIcon />} disabled={true}>
            {isMobile ? "Save" : "Save For Later"}
         </Button>
         <IconButton
            aria-owns={open ? "mouse-over-popover" : undefined}
            aria-haspopup="true"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            sx={{
               marginLeft: "5px",
            }}
            onClick={openProfilePage}
         >
            <InfoOutlinedIcon />
         </IconButton>
         <Popover
            id="mouse-over-popover"
            sx={{
               pointerEvents: "none",
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "left",
            }}
            transformOrigin={{
               vertical: "top",
               horizontal: "left",
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
         >
            {popoverContent}
         </Popover>
      </>
   )
}
