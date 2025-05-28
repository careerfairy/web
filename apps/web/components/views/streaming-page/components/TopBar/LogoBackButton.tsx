import ArrowBackIcon from "@mui/icons-material/ArrowBackIosRounded"
import { IconButton, Stack } from "@mui/material"
import Link from "components/views/common/Link"
import { sxStyles } from "types/commonTypes"
import { PlatformStreamLogo } from "./PlatformStreamLogo"

const styles = sxStyles({
   backIcon: {
      fontSize: 18,
      ml: -1,
   },
})

export const LogoBackButton = () => {
   return (
      <Stack
         component={Link}
         noLinkStyle
         href={"/portal"}
         direction="row"
         alignItems="center"
         target="_blank"
      >
         <IconButton sx={styles.backIcon}>
            <ArrowBackIcon fontSize="inherit" />
         </IconButton>
         <PlatformStreamLogo />
      </Stack>
   )
}
