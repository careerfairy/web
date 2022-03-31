import React from "react"
import IconButton from "@mui/material/IconButton"
import Hidden from "@mui/material/Hidden"
import Box from "@mui/material/Box"
import MenuIcon from "@mui/icons-material/Menu"
import { MainLogo } from "components/logos"
import { useTheme } from "@mui/material/styles"
import useGeneralLinks from "components/custom-hook/useGeneralLinks"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import { useAuth } from "../../../HOCs/AuthProvider"
import LoginButton from "../../../components/views/common/LoginButton"
import useGeneralHeader from "../../../components/custom-hook/useGeneralHeader"
import NavLinks from "../../../components/views/header/NavLinks"
import MissingDataButton from "../../../components/views/missingData/MissingDataButton"
import UserProfileButton from "../../../components/views/common/topbar/UserProfileButton"

const GenericHeader = ({
   hideNavOnScroll = false,
   position = "static",
   transparent = false,
   darkMode = false,
   links = [],
}: Props) => {
   const theme = useTheme()
   const { GeneralHeader } = useGeneralHeader()
   const { mainLinks } = useGeneralLinks()
   const dispatch = useDispatch()
   const handleDrawerOpen = () => dispatch(actions.openNavDrawer())
   const { authenticatedUser, userData } = useAuth()

   return (
      <GeneralHeader
         permanent={!hideNavOnScroll}
         className={undefined}
         position={position}
         transparent={transparent}
      >
         <Box display="flex" alignItems="center">
            <IconButton
               sx={{ mr: 1, color: darkMode && "white" }}
               color="primary"
               onClick={handleDrawerOpen}
               autoFocus
               size="large"
            >
               <MenuIcon />
            </IconButton>
            <MainLogo white={darkMode} />
         </Box>
         <Hidden mdDown>
            <NavLinks
               links={mainLinks}
               navLinksActiveColor={
                  darkMode
                     ? theme.palette.common.white
                     : theme.palette.primary.main
               }
               navLinksBaseColor={darkMode && theme.palette.common.white}
            />
         </Hidden>
         <Box sx={{ display: "flex", alignItems: "center" }}>
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

interface Props {
   className?: string
   links?: any[]
   onMobileNavOpen?: () => void
   darkMode: boolean
   hideNavOnScroll: boolean
   position: "absolute" | "fixed" | "sticky" | "static"
   transparent: boolean
}

export default GenericHeader
