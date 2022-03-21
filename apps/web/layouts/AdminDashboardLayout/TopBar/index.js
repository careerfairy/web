import React from "react"
import clsx from "clsx"
import PropTypes from "prop-types"
import { AppBar, Box, Hidden, IconButton, Toolbar } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import Link from "../../../materialUI/NextNavLink"
import { MainLogo, MiniLogo } from "../../../components/logos"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import NavLinks from "../../../components/views/header/NavLinks"

const useStyles = makeStyles((theme) => ({
   navIconButton: {
      color: "white !important",
   },
   toolbar: {
      display: "flex",
      justifyContent: "space-between",
   },
   root: {
      // Ensures top bar's Zindex is always above the drawer
      zIndex: theme.zIndex.drawer + 1,
   },
}))

const TopBar = ({ className, links, onMobileNavOpen, ...rest }) => {
   const classes = useStyles()
   const theme = useTheme()

   return (
      <AppBar elevation={1} className={clsx(classes.root, className)} {...rest}>
         <Toolbar className={classes.toolbar}>
            <Box display="flex" alignItems="center">
               <Hidden lgUp>
                  <IconButton
                     color="inherit"
                     onClick={onMobileNavOpen}
                     size="large"
                  >
                     <MenuIcon />
                  </IconButton>
               </Hidden>
               <Hidden mdDown>
                  <MainLogo white />
               </Hidden>
               <Hidden mdUp>
                  <MiniLogo />
               </Hidden>
            </Box>
            <Hidden mdDown>
               <NavLinks
                  links={links}
                  navLinksActiveColor={theme.palette.common.white}
                  navLinksBaseColor={theme.palette.common.white}
               />
            </Hidden>
            <Box>
               <Hidden lgDown>
                  <IconButton
                     id="profile_icon"
                     component={Link}
                     className={classes.navIconButton}
                     href="/profile"
                     size="large"
                  >
                     <AccountCircleOutlinedIcon />
                  </IconButton>
               </Hidden>
            </Box>
         </Toolbar>
      </AppBar>
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
