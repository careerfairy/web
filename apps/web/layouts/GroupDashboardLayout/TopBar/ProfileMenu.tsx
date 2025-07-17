import { Divider, MenuItem, Stack, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useRouter } from "next/router"

// react-feather icons
import { Home, LogOut, Repeat, User } from "react-feather"

// project imports
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { useAuth } from "../../../HOCs/AuthProvider"
import ColorizedAvatar from "../../../components/views/common/ColorizedAvatar"
import BrandedMenu from "../../../components/views/common/inputs/BrandedMenu"
import { useGroupDashboard } from "../GroupDashboardLayoutProvider"
import { useGroup } from "../index"

const ProfileSection = styled(MenuItem)({
   display: "flex",
   alignItems: "center",
   gap: "8px",
   padding: "16px !important",
   marginBottom: "0px !important",
})

const UserAvatar = styled(ColorizedAvatar)(({ theme }) => ({
   width: 48,
   height: 48,
   border: `1px solid ${theme.brand.white[100]}`,
   boxShadow: "0px 0px 8px 0px rgba(20, 20, 20, 0.06)",
}))

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
   display: "flex",
   alignItems: "center",
   gap: "8px",
   padding: "12px 20px !important",
   color: theme.palette.neutral[700],
   "& .MuiSvgIcon-root": {
      width: "16px",
      height: "16px",
      color: theme.palette.neutral[700],
   },
}))

const StyledDivider = styled(Divider)({
   margin: "9px 0",
   color: "rgba(0, 0, 0, 0.1)",
})

const StyledBrandedMenu = styled(BrandedMenu)(({ theme }) => ({
   "& .MuiPaper-root": {
      width: "283px",
      backgroundColor: theme.brand.white[100],
      border: `1px solid ${theme.brand.white[500]}`,
      boxShadow: "0px 0px 24px 0px rgba(20, 20, 20, 0.08)",
      borderRadius: "8px",
      padding: "0px 0px 8px",
      "& .MuiMenu-list": {
         padding: 0,
      },
   },
}))

type ProfileMenuProps = {
   anchorEl: HTMLElement | null
   open: boolean
   onClose: () => void
}

export const ProfileMenu = ({ anchorEl, open, onClose }: ProfileMenuProps) => {
   const { userData, signOut, userPresenter, adminGroups } = useAuth()
   const { group } = useGroup()
   const { push } = useRouter()
   const { openManageCompaniesDialog } = useGroupDashboard()

   const showSwitchButton =
      userData?.isAdmin || Object.keys(adminGroups).length > 1

   const handleProfileClick = () => {
      push(`/group/${group?.id}/admin/profile`)
      onClose()
   }

   const handleSwitchCompanyClick = () => {
      openManageCompaniesDialog()
      onClose()
   }

   const handlePortalClick = () => {
      push("/portal")
      onClose()
   }

   const handleLogoutClick = () => {
      signOut()
      onClose()
   }

   const menuItems = [
      {
         key: "profile",
         label: "Profile",
         icon: <User size={16} />,
         onClick: handleProfileClick,
         show: true,
      },
      {
         key: "switchCompany",
         label: "Switch company",
         icon: <Repeat size={16} />,
         onClick: handleSwitchCompanyClick,
         show: Boolean(showSwitchButton),
      },
      {
         key: "portal",
         label: "Student portal",
         icon: <Home size={16} />,
         onClick: handlePortalClick,
         show: true,
      },
      {
         key: "divider",
         divider: true,
         show: true,
      },
      {
         key: "logout",
         label: "Log out",
         icon: <LogOut size={16} />,
         onClick: handleLogoutClick,
         show: true,
      },
   ]

   return (
      <StyledBrandedMenu
         anchorEl={anchorEl}
         open={open}
         onClose={onClose}
         anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
         }}
         transformOrigin={{
            vertical: "top",
            horizontal: "right",
         }}
      >
         {/* Profile Section */}
         <ProfileSection onClick={handleProfileClick}>
            <UserAvatar
               imageUrl={userData?.avatar}
               lastName={userData?.lastName}
               firstName={userData?.firstName}
            />
            <Stack>
               <Typography
                  variant="medium"
                  color="neutral.800"
                  fontWeight={600}
               >
                  {userPresenter?.getDisplayName()}
               </Typography>
               <Typography
                  sx={getMaxLineStyles(1)}
                  variant="xsmall"
                  color="neutral.600"
               >
                  {userPresenter?.getPosition()}
               </Typography>
            </Stack>
         </ProfileSection>

         {/* Menu Items */}
         {menuItems
            .filter((item) => item.show)
            .map(({ divider, key, label, icon, onClick }) =>
               divider ? (
                  <StyledDivider key={key} />
               ) : (
                  <StyledMenuItem key={key} onClick={onClick}>
                     {icon}
                     <Typography variant="small" color="neutral.700">
                        {label}
                     </Typography>
                  </StyledMenuItem>
               )
            )}
      </StyledBrandedMenu>
   )
}
