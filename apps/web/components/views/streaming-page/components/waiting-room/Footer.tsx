import { userIsTargetedApp } from "@careerfairy/shared-lib/countries/filters"
import { Box, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"
import { MobileUtils } from "util/mobile.utils"
import { MobileAppPrompt } from "./MobileAppPrompt"

const styles = sxStyles({
   root: {
      mt: "auto",
      mx: "auto",
      backgroundColor: "#FDFDFD",
      textAlign: "center",
      justifyContent: "center",
      display: "flex",
      borderTopLeftRadius: "100% 284px",
      borderTopRightRadius: "100% 284px",
      maxWidth: 1099,
   },
   tip: {
      color: "neutral.800",
      maxWidth: {
         xs: 286,
         sm: 418,
         tablet: 508,
      },
   },
})

export const Footer = () => {
   const streamIsMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()
   const { userData } = useAuth()

   if (!MobileUtils.webViewPresence() && userIsTargetedApp(userData))
      return <MobileAppPrompt />

   return (
      <Box
         sx={styles.root}
         width={streamIsMobile ? "100%" : "80%"}
         minHeight={streamIsLandscape ? 75 : streamIsMobile ? 80 : 155}
         pt={streamIsLandscape ? 3.125 : streamIsMobile ? 3 : 7.75}
      >
         <Typography
            sx={styles.tip}
            variant={streamIsMobile ? "xsmall" : "medium"}
            component="p"
         >
            <Box component="span" fontWeight={600} color="primary.main">
               Pro tip:
            </Box>{" "}
            Leave this tab open so you don&apos;t miss a moment! The stream will
            start here automatically.
         </Typography>
      </Box>
   )
}
