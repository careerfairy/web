import React from "react"
import IconButton from "@mui/material/IconButton"
import Hidden from "@mui/material/Hidden"
import Box from "@mui/material/Box"
import MenuIcon from "@mui/icons-material/Menu"
import { MainLogo } from "components/logos"
import { useTheme } from "@mui/material/styles"
import useGeneralLinks, {
   PageLinkProps,
} from "components/custom-hook/useGeneralLinks"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import { useAuth } from "../../../HOCs/AuthProvider"
import LoginButton from "../common/LoginButton"
import NavLinks from "../../../components/views/header/NavLinks"
import MissingDataButton from "../../../components/views/missingData/MissingDataButton"
import UserProfileButton from "../../../components/views/common/topbar/UserProfileButton"
import GeneralHeader from "./GeneralHeader"
import { useWindowScroll } from "react-use"

const GenericHeader = ({
   hideNavOnScroll = false,
   position = "static",
   transparent = false,
   darkMode = false,
   links = [],
   isDesktop,
   endContent,
}: Props) => {
   const theme = useTheme()
   const { mainLinks } = useGeneralLinks()
   const dispatch = useDispatch()
   const handleDrawerToggle = () => dispatch(actions.toggleNavDrawer())
   const { authenticatedUser, userData } = useAuth()
   const { y: verticalOffset } = useWindowScroll()
   const scrolledDown = verticalOffset > 40

   return (
      <GeneralHeader
         permanent={!hideNavOnScroll}
         position={position}
         transparent={transparent}
      >
         <Box display="flex" alignItems="center">
            {!isDesktop && (
               <IconButton
                  sx={{
                     mr: 1,
                     color: darkMode && !scrolledDown && "white",
                     zIndex: 1,
                  }}
                  color="primary"
                  onClick={handleDrawerToggle}
                  size="large"
               >
                  <MenuIcon />
               </IconButton>
            )}
            <MainLogo white={darkMode && !scrolledDown} />
         </Box>
         <Hidden mdDown>
            <NavLinks
               links={links.length ? links : mainLinks}
               navLinksActiveColor={
                  darkMode && !scrolledDown
                     ? theme.palette.common.white
                     : theme.palette.primary.main
               }
               navLinksBaseColor={
                  darkMode && !scrolledDown && theme.palette.common.white
               }
            />
         </Hidden>
         <Box sx={{ display: "flex", alignItems: "center" }}>
            {endContent}
            <Hidden lgDown>
               <MissingDataButton />
               {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                  <div>
                     <LoginButton />
                  </div>
               ) : (
                  <UserProfileButton />
               )}
            </Hidden>
         </Box>
      </GeneralHeader>
   )
}

interface Props {
   className?: string
   links?: PageLinkProps[]
   onMobileNavOpen?: () => void
   darkMode?: boolean
   hideNavOnScroll?: boolean
   position?: "absolute" | "fixed" | "sticky" | "static"
   transparent?: boolean
   isDesktop?: boolean
   endContent?: React.ReactNode
}

export default GenericHeader
