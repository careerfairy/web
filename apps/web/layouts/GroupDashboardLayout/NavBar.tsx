import React from "react"

// material-ui
import { Box, CircularProgress } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import BottomLinks from "../common/BottomLinks"
import { useGroup } from "./index"
import EditGroupLogo from "./EditGroupLogo"
import { SuspenseWithBoundary } from "../../components/ErrorBoundary"
import GroupNavList from "./GroupNavList"

const NavBar = () => {
   const { group } = useGroup()

   if (!group) {
      return null
   }

   return (
      <Stack flex={1} alignItems={"center"}>
         <EditGroupLogo />
         <SuspenseWithBoundary fallback={<CircularProgress />}>
            <GroupNavList />
         </SuspenseWithBoundary>
         <Box flexGrow={1} />
         <BottomLinks />
      </Stack>
   )
}

export default NavBar
