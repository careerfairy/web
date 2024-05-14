import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { Box, Slide } from "@mui/material"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import {
   useIsSpotlightMode,
   useLivestreamMode,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { UserStream } from "../../../types"
import { SpotlightPDF } from "./SpotlightPDF"
import { SpotlightProvider } from "./SpotlightProvider"
import { SpotlightStream } from "./SpotlightStream"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      borderRadius: "10px",
      justifyContent: "center",
      alignItems: "center",
   },
})

const Content = {
   [LivestreamModes.DESKTOP]: <SpotlightStream />,
   [LivestreamModes.PRESENTATION]: <SpotlightPDF />,
   [LivestreamModes.VIDEO]: (
      <Box>Rendering YouTube Video Spotlight Content</Box>
   ),
} as const

type Props = {
   stream: UserStream
}

export const Spotlight = ({ stream }: Props) => {
   const isLandscape = useStreamIsLandscape()
   const isSpotlightMode = useIsSpotlightMode()
   const livestreamMode = useLivestreamMode()

   return (
      <Slide
         in={isSpotlightMode}
         direction={isLandscape ? "right" : "up"}
         unmountOnExit
      >
         <Box sx={styles.root}>
            <SpotlightProvider stream={stream}>
               {Content[livestreamMode] || null}
            </SpotlightProvider>
         </Box>
      </Slide>
   )
}
