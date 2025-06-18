import { Button, Stack, Typography } from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { appQrCodeLSRoom, cfMobileIcon } from "constants/images"
import Image from "next/image"
import { Download } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      mt: "auto",
      mx: "auto",
      backgroundColor: "rgba(209, 246, 237, 0.45)",
      textAlign: "center",
      justifyContent: "center",
      display: "flex",
      borderTopLeftRadius: "80% 284px",
      borderTopRightRadius: "80% 284px",
      maxWidth: 1099,
      alignItems: "center",
   },
   rootMobile: {
      borderTopLeftRadius: "200% 284px",
      borderTopRightRadius: "200% 284px",
   },

   tip: {
      maxWidth: {
         xs: 235,
         sm: 418,
         tablet: 508,
      },
   },
})

export const MobileAppPrompt = () => {
   const streamIsMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()

   if (streamIsMobile) return <MobilePrompt />

   return (
      <Stack
         sx={styles.root}
         width={streamIsMobile ? "100%" : "80%"}
         minHeight={streamIsLandscape ? 75 : streamIsMobile ? 80 : 155}
         pt={streamIsLandscape ? 3.125 : streamIsMobile ? 3 : 7.75}
      >
         <Image
            src={appQrCodeLSRoom}
            alt="App QR code"
            width={147}
            height={147}
            style={{
               borderRadius: "12px",
               border: "8px solid white",
               boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
               marginTop: "-175px",
               marginBottom: "8px",
            }}
         />
         <Typography
            sx={styles.tip}
            variant={streamIsMobile ? "xsmall" : "medium"}
            color="primary.main"
            fontWeight={600}
         >
            Get CareerFairy on the go
         </Typography>
         <Typography
            sx={styles.tip}
            variant={streamIsMobile ? "xsmall" : "medium"}
            color="neutral.700"
            fontWeight={400}
         >
            scan the QR code to download the app!
         </Typography>
      </Stack>
   )
}

const MobilePrompt = () => {
   const streamIsMobile = useStreamIsMobile()

   const streamIsLandscape = useStreamIsLandscape()
   return (
      <Stack
         sx={[styles.root, styles.rootMobile]}
         width={streamIsMobile ? "100%" : "80%"}
         minHeight={streamIsLandscape ? 75 : streamIsMobile ? 80 : 155}
         pt={streamIsLandscape ? 3.125 : streamIsMobile ? 3 : 7.75}
         spacing={1}
         pb={2}
      >
         <Image
            src={cfMobileIcon}
            alt="CareerFairy Logo"
            width={64}
            height={64}
            style={{
               borderRadius: "12px",
               boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
               marginTop: "-50px",
            }}
         />
         <Typography sx={styles.tip} variant="medium" color="neutral.800">
            Download our app now for an even better experience.
         </Typography>
         <Button
            variant="contained"
            component="a"
            href={"https://careerfairy.app.link/cfappdownloadpage"}
            target="_blank"
            startIcon={<Download />}
         >
            Download the app
         </Button>
      </Stack>
   )
}
