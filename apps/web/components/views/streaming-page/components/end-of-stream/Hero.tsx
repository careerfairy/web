import { Box, Container, Grow, Typography } from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import Image from "next/image"
import { useStreamTitle } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
   },
   marginDesktop: {
      mt: 11.25,
      mb: 8.75,
   },
   marginTablet: {
      mt: 1,
      mb: 4,
   },
   marginMobile: {
      mt: 2.5,
      mb: 4.5,
   },
   rocket: {
      fontSize: "96px",
   },
   thanksMessage: {
      fontWeight: 600,
   },
})

const getRocketGutter = (
   streamIsLandscape: boolean,
   streamIsMobile: boolean
) => {
   if (streamIsLandscape) {
      return 20
   }
   if (streamIsMobile) {
      return 15
   }

   return 32 // desktop/mobile-portrait
}

const getThanksGutter = (
   streamIsLandscape: boolean,
   streamIsMobile: boolean
) => {
   if (streamIsLandscape) {
      return 12
   }
   if (streamIsMobile) {
      return 0
   }

   return 24 // desktop/mobile-portrait
}

export const Hero = () => {
   const streamIsMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()

   const streamTitle = useStreamTitle()

   return (
      <Container
         maxWidth="sm"
         sx={[
            styles.root,
            streamIsLandscape && styles.marginTablet,
            streamIsMobile ? styles.marginMobile : styles.marginDesktop,
         ]}
      >
         <Grow in timeout={1000}>
            <Image
               src="/illustrations/rocket-green.png"
               alt="rocket"
               width={streamIsMobile ? 95 : 128}
               height={streamIsMobile ? 103 : 139}
            />
         </Grow>
         <Box height={getRocketGutter(streamIsLandscape, streamIsMobile)} />
         <Typography
            component="h4"
            variant={streamIsMobile ? "medium" : "desktopBrandedH4"}
            sx={styles.thanksMessage}
         >
            <Box color="primary.main" component="span">
               Thanks{" "}
            </Box>
            for watching!
         </Typography>
         <Box height={getThanksGutter(streamIsLandscape, streamIsMobile)} />
         <Typography
            component="h1"
            variant={streamIsMobile ? "desktopBrandedH2" : "desktopBrandedH3"}
            fontWeight={streamIsMobile ? 700 : 600}
         >
            {streamTitle}
         </Typography>
      </Container>
   )
}
