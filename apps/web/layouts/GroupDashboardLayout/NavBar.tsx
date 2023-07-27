import { useCallback } from "react"
import { Maximize2, Minimize2 } from "react-feather"

// material-ui
import { Box, IconButton } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import BottomLinks from "../common/BottomLinks"
import { useGroup } from "./index"
import EditGroupLogo from "./EditGroupLogo"
import GroupNavList from "./GroupNavList"
import { sxStyles } from "types/commonTypes"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   expandButtonContainer: {
      width: "100%",
      textAlign: "right",
   },
   expandButton: {
      padding: 1,
      color: "#BDBCBC",
   },
})

const NavBar = () => {
   const { group } = useGroup()

   if (!group) {
      return null
   }

   return (
      <Stack flex={1} alignItems={"center"} borderRight={"1px solid #EDE7FD"}>
         <ShrunkToggleButton />
         <EditGroupLogo />
         <GroupNavList />
         <Box flexGrow={1} />
         <BottomLinks />
      </Stack>
   )
}

const ShrunkToggleButton = () => {
   const { shrunkLeftMenuIsActive, setShrunkLeftMenuState } = useGroup()
   const isMobile = useIsMobile()

   const onClick = useCallback(() => {
      setShrunkLeftMenuState(shrunkLeftMenuIsActive ? "open" : "shrunk")
   }, [setShrunkLeftMenuState, shrunkLeftMenuIsActive])

   if (isMobile) {
      return null
   }

   const Icon = shrunkLeftMenuIsActive ? (
      <Maximize2 width={15} />
   ) : (
      <Minimize2 width={15} />
   )

   return (
      <Box sx={styles.expandButtonContainer}>
         <IconButton sx={styles.expandButton} onClick={onClick}>
            {Icon}
         </IconButton>
      </Box>
   )
}

export default NavBar
