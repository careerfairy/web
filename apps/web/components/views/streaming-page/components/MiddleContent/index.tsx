import { Stack } from "@mui/material"
import {
   useSideDrawer,
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import {
   useIsSpotlightMode,
   useStreamHandRaiseEnabled,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { SidePanel } from "../SidePanel"
import { StreamingGrid } from "../StreamingGrid"
import { HandRaiseActiveBanner } from "../hand-raise/HandRaiseActiveBanner"
import { MiddleContentLayout } from "./MiddleContentLayout"

const styles = sxStyles({
   root: {
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
   },
   fullHeight: {
      height: "100%",
   },
   inner: {
      transition: (theme) => theme.transitions.create("padding"),
   },
   stack: {
      flex: 1,
      height: "fill-available",
      minHeight: "1px",
   },
   stackMobileLandscape: {
      flexDirection: "column",
   },
})

export const MiddleContent = () => {
   const isLandscape = useStreamIsLandscape()
   const isMobile = useStreamIsMobile()
   const isSpotlightMode = useIsSpotlightMode()
   const handRaiseEnabled = useStreamHandRaiseEnabled()
   const { isHost } = useStreamingContext()

   const { isOpen } = useSideDrawer()

   return (
      <MiddleContentLayout
         sxProps={{
            pt: getTopPadding({
               isSpotlightMode,
               isMobile,
               isLandscape,
               bannerActive: handRaiseEnabled && isHost,
            }),
            pb: isLandscape ? 3.125 : isMobile ? 2 : isSpotlightMode ? 2 : 2,
         }}
      >
         <HandRaiseActiveBanner />
         <Stack
            sx={styles.stack}
            direction="row"
            spacing={isMobile || !isOpen ? 0 : 2.5}
         >
            <StreamingGrid />
            <SidePanel />
         </Stack>
      </MiddleContentLayout>
   )
}

type TopPaddingProps = {
   isSpotlightMode: boolean
   isMobile: boolean
   isLandscape: boolean
   bannerActive: boolean
}

const getTopPadding = ({
   isSpotlightMode,
   isMobile,
   isLandscape,
   bannerActive,
}: TopPaddingProps) => {
   if (isLandscape) {
      return 1.5
   }
   if (isMobile) {
      if (bannerActive) return 0.5
      return 3
   }

   if (bannerActive) return 2.5
   if (isSpotlightMode) return 2
   return 3.875
}
