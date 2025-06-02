import { Typography } from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useHasLivestreamStarted } from "./useHasLivestreamStarted"

export const StatusTitle = () => {
   const streamIsMobile = useStreamIsMobile()

   const hasLivestreamStarted = useHasLivestreamStarted()
   const streamIsLandscape = useStreamIsLandscape()

   return (
      <>
         <Typography
            textAlign="center"
            variant={streamIsMobile ? "mobileBrandedH2" : "desktopBrandedH1"}
            fontWeight={streamIsMobile ? 700 : 600}
            maxWidth={streamIsMobile ? "auto" : 848}
            px={streamIsMobile ? 2 : 0}
            {...getMarginStyles(streamIsLandscape, hasLivestreamStarted)}
            sx={{
               whiteSpace:
                  streamIsMobile && !streamIsLandscape ? "pre-line" : "normal",
            }}
            component="h1"
            color={"neutral.800"}
         >
            {hasLivestreamStarted
               ? "The hosts are making the final preparations and will welcome you shortly."
               : `Get ready!\nThe live stream starts soon.`}
         </Typography>
         {!hasLivestreamStarted && (
            <Typography
               textAlign="center"
               variant={streamIsMobile ? "mobileBrandedH4" : "desktopBrandedH3"}
               maxWidth={streamIsMobile ? "auto" : 1075}
               px={streamIsMobile ? 2 : 0}
               mb={streamIsLandscape ? 1.5 : 4}
               color={"neutral.800"}
            >
               You&apos;re in the right place to discover expert insights and
               get your questions answered live.
            </Typography>
         )}
      </>
   )
}

const getMarginStyles = (
   streamIsLandscape: boolean,
   hasLivestreamStarted: boolean
) => {
   if (streamIsLandscape) {
      return {
         mt: 1.5,
         mb: hasLivestreamStarted ? 1.5 : 0.5,
      }
   }

   return {
      mt: 3,
      mb: hasLivestreamStarted ? 4 : 1.5,
   }
}
