import { Typography } from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useHasLivestreamStarted } from "./useLivestreamHasStarted"

export const StatusTitle = () => {
   const streamIsMobile = useStreamIsMobile()

   const hasLivestreamStarted = useHasLivestreamStarted()
   const streamIsLandscape = useStreamIsLandscape()

   return (
      <Typography
         textAlign="center"
         variant={streamIsMobile ? "mobileBrandedH2" : "desktopBrandedH1"}
         fontWeight={streamIsMobile ? 700 : 600}
         maxWidth={streamIsMobile ? "auto" : 848}
         px={streamIsMobile ? 2 : 0}
         {...getMarginStyles(streamIsLandscape)}
         component="h1"
      >
         {hasLivestreamStarted
            ? "Don’t panic, the hosts are getting ready! They will welcome you in few seconds."
            : "The live stream is about to start!"}
      </Typography>
   )
}

const getMarginStyles = (streamIsLandscape: boolean) => {
   if (streamIsLandscape) {
      return {
         mt: 1.5,
         mb: 1.5,
      }
   }

   return {
      mt: 3,
      mb: 4,
   }
}
