import { ButtonBase } from "@mui/material"
import { styled } from "@mui/material/styles"

// project imports
import useIsMobile from "components/custom-hook/useIsMobile"
import { useAuth } from "../../../HOCs/AuthProvider"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import { useGroupDashboard } from "../GroupDashboardLayoutProvider"

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

   return (
      <AvatarButton
         onClick={() => {
            if (isMobile) {
               toggleMobileProfileDrawer()
            } else {
               /**
                * TODO: Open drop down menu
                */
            }
         }}
         aria-label="Open profile menu"
      >
         <Avatar
            imageUrl={userData?.avatar}
            lastName={userData?.lastName}
            firstName={userData?.firstName}
         />
      </AvatarButton>
   )
}
