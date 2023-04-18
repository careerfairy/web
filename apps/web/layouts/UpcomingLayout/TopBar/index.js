import React from "react"
import PropTypes from "prop-types"
import { Box, Hidden, IconButton } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { MainLogo } from "components/logos"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import useGeneralLinks from "components/custom-hook/useGeneralLinks"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import { useAuth } from "../../../HOCs/AuthProvider"
import LoginButton from "../../../components/views/common/LoginButton"
import GeneralHeader from "../../../components/views/header/GeneralHeader"
import NavLinks from "../../../components/views/header/NavLinks"
import MissingDataButton from "../../../components/views/missingData/MissingDataButton"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import ProfileMenu from "../../GenericDashboardLayout/TopBar/ProfileMenu"

const useStyles = makeStyles((theme) => ({
   header: {
      color: theme.palette.common.white,
   },
   accountIcon: {
      color: theme.palette.common.white,
   },
}))
const TopBar = () => {
   const theme = useTheme()
   const classes = useStyles()
   const isMobile = useIsMobile()
   const { mainLinks } = useGeneralLinks()
   const dispatch = useDispatch()
   const handleDrawerOpen = () => dispatch(actions.openNavDrawer())
   const { authenticatedUser } = useAuth()

   return (
      <GeneralHeader position="absolute" transparent className={classes.header}>
         <Box display="flex" alignItems="center">
            {isMobile ? (
               <IconButton
                  style={{ marginRight: "1rem" }}
                  color="inherit"
                  onClick={handleDrawerOpen}
                  size="large"
               >
                  <MenuIcon />
               </IconButton>
            ) : null}
            <MainLogo white sx={isMobile ? null : { ml: 9 }} />
         </Box>
         <Hidden mdDown>
            <NavLinks
               links={mainLinks}
               navLinksActiveColor={theme.palette.common.white}
               navLinksBaseColor={theme.palette.common.white}
            />
         </Hidden>
         <Box display="flex" alignItems="center">
            <Hidden lgDown>
               <MissingDataButton />
               <Box ml={2}>
                  {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                     <div>
                        <LoginButton />
                     </div>
                  ) : (
                     <ProfileMenu />
                  )}
               </Box>
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
