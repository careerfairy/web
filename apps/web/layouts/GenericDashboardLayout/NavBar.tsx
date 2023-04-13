import React from "react"

// material-ui
import { Box } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import BottomLinks from "../common/BottomLinks"
import { useGroup } from "../GroupDashboardLayout"
import EditGroupLogo from "../GroupDashboardLayout/EditGroupLogo"
import GroupNavList from "../GroupDashboardLayout/GroupNavList"
import { MainLogo } from "../../components/logos"
import GenericNavList from "./GenericNavList"
import { sxStyles } from "../../types/commonTypes"
import useIsMobile from "../../components/custom-hook/useIsMobile"

const styles = sxStyles({
   logoWrapper: {
      height: 180,
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
   },
})

const NavBar = () => {
   const { group } = useGroup()
   const isMobile = useIsMobile()

   if (!group) {
      return isMobile ? (
         <Box> Bottom bar </Box>
      ) : (
         <Stack
            flex={1}
            alignItems={"center"}
            borderRight={"1px solid #EDE7FD"}
         >
            <Box sx={styles.logoWrapper}>
               <MainLogo sx={{ maxWidth: "100%" }} />
            </Box>
            <GenericNavList />
            <Box flexGrow={1} />
            <BottomLinks hideMainLogo={true} />
         </Stack>
      )
   }

   return (
      <Stack flex={1} alignItems={"center"} borderRight={"1px solid #EDE7FD"}>
         <EditGroupLogo />
         <GroupNavList />
         <Box flexGrow={1} />
         <BottomLinks />
      </Stack>
   )
}

export default NavBar
