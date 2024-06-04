import { Box, Typography } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "absolute",
      bottom: 0,
      backgroundColor: "#FDFDFD",
      textAlign: "center",
      justifyContent: "center",
      display: "flex",
      pb: {
         xs: 2.75,
         md: 1.25,
         tablet: 3.75,
      },
      pt: {
         xs: 5.5,
         tablet: 7.75,
      },
      borderTopLeftRadius: "67% 184px",
      borderTopRightRadius: "67% 184px",
   },
   tip: {
      maxWidth: {
         xs: 286,
         md: 418,
         tablet: 508,
      },
   },
})

export const Footer = () => {
   const streamIsMobile = useStreamIsMobile()
   return (
      <Box width={streamIsMobile ? "100%" : "80%"} sx={styles.root}>
         <Typography
            variant={streamIsMobile ? "xsmall" : "medium"}
            color="neutral.800"
            component="p"
            sx={styles.tip}
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
