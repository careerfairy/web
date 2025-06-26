// material-ui
import { Box } from "@mui/material"
import Stack from "@mui/material/Stack"

// project imports
import { MainLogo } from "../../components/logos"
import { sxStyles } from "../../types/commonTypes"
import BottomLinks from "../common/BottomLinks"
import { GenericNavList } from "./GenericNavList"

const styles = sxStyles({
   logoWrapper: {
      mt: "24px",
      mb: "44px",
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
         <BottomLinks />
      </Stack>
   )
}

export default NavBar
