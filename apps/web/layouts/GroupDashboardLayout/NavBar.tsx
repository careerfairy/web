import { useCallback } from "react"
import { Maximize2 as Maximize, Minimize2 as Minimize } from "react-feather"

// material-ui
import { Box, IconButton } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import BottomLinks from "../common/BottomLinks"
import { useGroup } from "./index"
import EditGroupCard from "./EditGroupCard"
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
         <EditGroupCard />
         <GroupNavList />
         <Box flexGrow={1} />
         <BottomLinks />
      </Stack>
   )
}

const ShrunkToggleButton = () => {
   const {
      shrunkLeftMenuIsActive,
      shrunkLeftMenuState,
      setShrunkLeftMenuState,
   } = useGroup()
   const isMobile = useIsMobile()

   const onClick = useCallback(() => {
      setShrunkLeftMenuState(shrunkLeftMenuIsActive ? "open" : "shrunk")
   }, [setShrunkLeftMenuState, shrunkLeftMenuIsActive])

   if (isMobile || shrunkLeftMenuState === "disabled") {
      return null
   }

   const Icon = shrunkLeftMenuIsActive ? (
      <Maximize width={15} />
   ) : (
      <Minimize width={15} />
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
