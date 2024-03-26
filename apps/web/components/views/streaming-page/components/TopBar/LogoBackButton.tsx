import ArrowBackIcon from "@mui/icons-material/ArrowBackIosRounded"
import Image from "next/image"
import Link from "components/views/common/Link"
import { IconButton, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"

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
         href={"/"}
         direction="row"
         alignItems="center"
      >
         <IconButton sx={styles.backIcon}>
            <ArrowBackIcon fontSize="inherit" />
         </IconButton>
         <Image
            style={{
               objectFit: "contain",
            }}
            src="/logo_teal.png"
            width={150}
            height={32}
            alt={"cf-logo"}
            priority
         />
      </Stack>
   )
}
