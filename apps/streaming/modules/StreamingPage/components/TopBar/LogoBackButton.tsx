import ArrowBackIcon from "@mui/icons-material/ArrowBackIosRounded"
import Image from "next/image"
import { Link } from "components"
import { Stack } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"

const styles = sxStyles({
   backicon: {
      fontSize: 18,
   },
})

export const LogoBackButton = () => {
   return (
      <Stack
         component={Link}
         noLinkStyle
         href={"https://careerfairy.io"}
         direction="row"
         alignItems="center"
      >
         <ArrowBackIcon sx={styles.backicon} />
         <Image
            style={{
               objectFit: "contain",
            }}
            src="/logo_teal.png"
            width={150}
            height={32}
            alt={"cf-logo"}
         />
      </Stack>
   )
}
