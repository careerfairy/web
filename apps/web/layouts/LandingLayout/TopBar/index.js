import React from "react"
import PropTypes from "prop-types"
import { Box, Hidden, IconButton } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { MainLogo } from "components/logos"
import { useTheme } from "@mui/material/styles"
import useGeneralLinks from "components/custom-hook/useGeneralLinks"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import { useAuth } from "../../../HOCs/AuthProvider"
import LoginButton from "../../../components/views/common/LoginButton"
import GeneralHeader from "../../../components/views/header/GeneralHeader"
import NavLinks from "../../../components/views/header/NavLinks"
import MissingDataButton from "../../../components/views/missingData/MissingDataButton"
import UserProfileButton from "../../../components/views/common/topbar/UserProfileButton"

const TopBar = () => {
   const theme = useTheme()

   const { landingLinks } = useGeneralLinks()
   const dispatch = useDispatch()
   const handleDrawerOpen = () => dispatch(actions.openNavDrawer())
   const { authenticatedUser, userData } = useAuth()

   return (
      <GeneralHeader permanent transparent>
         <Box
            sx={{
               display: "flex",
               alignItems: "center",
            }}
         >
            <IconButton
               sx={{
                  marginRight: "1rem",
               }}
               color="primary"
               onClick={handleDrawerOpen}
               size="large"
            >
               <MenuIcon />
            </IconButton>
            <MainLogo />
         </Box>
         <Hidden mdDown>
            <NavLinks
               links={landingLinks}
               navLinksActiveColor={theme.palette.primary.main}
            />
         </Hidden>
         <Box
            sx={{
               display: "flex",
               alignItems: "center",
            }}
         >
            <Hidden lgDown>
               <MissingDataButton />
               {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                  <div>
                     <LoginButton />
                  </div>
               ) : (
                  <UserProfileButton userBadges={userData?.badges} />
               )}
            </Hidden>
         </Box>
      </GeneralHeader>
   )
}

TopBar.propTypes = {
   className: PropTypes.string,
   links: PropTypes.array,
   onMobileNavOpen: PropTypes.func,
}

TopBar.defaultProps = {
   links: [],
}
export default TopBar
