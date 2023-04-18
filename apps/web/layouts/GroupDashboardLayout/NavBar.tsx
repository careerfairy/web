import React from "react"

// material-ui
import { Box } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import BottomLinks from "../common/BottomLinks"
import { useGroup } from "./index"
import EditGroupLogo from "./EditGroupLogo"
import GroupNavList from "./GroupNavList"

const NavBar = () => {
   const { group } = useGroup()

   if (!group) {
      return null
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
