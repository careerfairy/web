import { Box, Typography } from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      mt: "auto",
      mx: "auto",
      backgroundColor: "#FDFDFD",
      textAlign: "center",
      justifyContent: "center",
      display: "flex",
      borderTopLeftRadius: "67% 284px",
      borderTopRightRadius: "67% 284px",
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

   return (
      <Box
         sx={styles.root}
         width={streamIsMobile ? "100%" : "80%"}
         minHeight={streamIsLandscape ? 75 : streamIsMobile ? 80 : 155}
         pt={streamIsLandscape ? 3.125 : streamIsMobile ? 2.5 : 7.75}
      >
         <Typography
            sx={styles.tip}
            variant={streamIsMobile ? "xsmall" : "medium"}
            component="p"
         >
            <Box component="span" fontWeight={600} color="primary.main">
               Tip:
            </Box>{" "}
            During the stream, your microphone and webcam will not be accessible
            to anyone unless you raise your hand.
         </Typography>
      </Box>
   )
}
