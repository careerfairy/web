import { IconButton, Stack } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import Link from "components/views/common/Link"
import { X } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { Header } from "../TopBar/Header"
import { LogoBackButton } from "../TopBar/LogoBackButton"
import { PlatformStreamLogo } from "../TopBar/PlatformStreamLogo"

const styles = sxStyles({
   closeButton: {
      p: 0.5,
      m: -0.5,
   },
   root: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
   },
})
export const EndOfStreamHeader = () => {
   const streamIsMobile = useStreamIsMobile()
   return (
      <Header>
         <Stack sx={styles.root}>
            {streamIsMobile ? <PlatformStreamLogo /> : <LogoBackButton />}
            <IconButton
               component={Link}
               noLinkStyle
               href={"/portal"}
               sx={styles.closeButton}
            >
               <X />
            </IconButton>
         </Stack>
      </Header>
   )
}
