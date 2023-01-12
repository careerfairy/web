import React from "react"

// material-ui
import { Box } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import useDashboardLinks from "../../components/custom-hook/useDashboardLinks"
import BottomLinks from "../common/BottomLinks"
import NavList from "../common/NavList"
import { useGroup } from "./index"
import EditGroupLogo from "./EditGroupLogo"

const NavBar = () => {
   const { group } = useGroup()

   const mainLinks = useDashboardLinks(group)

   if (!group) {
      // TODO: add loading UI
      return null
   }

   return (
      <Stack flex={1} alignItems={"center"}>
         <EditGroupLogo />
         <NavList links={mainLinks} />
         <Box flexGrow={1} />
         <BottomLinks />
      </Stack>
   )
}

export default NavBar
