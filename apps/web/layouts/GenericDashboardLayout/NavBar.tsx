import React from "react"

// material-ui
import { Box } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import BottomLinks from "../common/BottomLinks"
import { MainLogo } from "../../components/logos"
import GenericNavList from "./GenericNavList"
import { sxStyles } from "../../types/commonTypes"

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
   return (
      <Stack flex={1} alignItems={"center"} borderRight={"1px solid #EDE7FD"}>
         <Box sx={styles.logoWrapper}>
            <MainLogo sx={{ maxWidth: "100%" }} />
         </Box>
         <GenericNavList />
         <Box flexGrow={1} />
         <BottomLinks hideMainLogo={true} />
      </Stack>
   )
}

export default NavBar
