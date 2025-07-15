import { ButtonBase } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Fragment } from "react"

// project imports
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import { useAuth } from "../../../HOCs/AuthProvider"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import { useGroupDashboard } from "../GroupDashboardLayoutProvider"
import { ProfileMenu } from "./ProfileMenu"

const AvatarButton = styled(ButtonBase)(({ theme }) => ({
   borderRadius: "50%",
   padding: 0,
   overflow: "hidden",
   "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
   },
   "&:focus": {
      outline: "2px solid",
      outlineColor: theme.palette.secondary.light,
      outlineOffset: "2px",
   },
}))

const Avatar = styled(ColorizedAvatar)({
   width: 40,
   height: 40,
})

export const ProfileAvatar = () => {
   const { userData } = useAuth()
   const { toggleMobileProfileDrawer } = useGroupDashboard()
   const isMobile = useIsMobile()
   const { anchorEl, handleClick, handleClose, open } = useMenuState()

   const handleAvatarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isMobile) toggleMobileProfileDrawer()
      else handleClick(event)
   }

   return (
      <Fragment>
         <AvatarButton
            onClick={handleAvatarClick}
            aria-label="Open profile menu"
         >
            <Avatar
               imageUrl={userData?.avatar}
               lastName={userData?.lastName}
               firstName={userData?.firstName}
            />
         </AvatarButton>

         {/* Desktop Profile Menu */}
         <ProfileMenu anchorEl={anchorEl} open={open} onClose={handleClose} />
      </Fragment>
   )
}
