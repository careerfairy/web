import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import { forwardRef } from "react"
import { useLivestreamMode } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { UserStream } from "../../../types"
import { UserStreamComponent } from "../StreamsGrid/UserStreamComponent"
import { SpotlightProvider, useSpotlight } from "./SpotlightProvider"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      borderRadius: "10px",
   },
})

type Props = {
   stream: UserStream
}

export const Spotlight = forwardRef<HTMLDivElement, Props>(
   ({ stream }, ref) => {
      return (
         <SpotlightProvider stream={stream}>
            <Box ref={ref} sx={styles.root}>
               <SpotlightContent />
            </Box>
         </SpotlightProvider>
      )
   }
)

Spotlight.displayName = "Spotlight"

export const SpotlightContent = () => {
   const livestreamMode = useLivestreamMode()

   if (livestreamMode === LivestreamModes.DESKTOP) {
      return <SpotlightStream />
   }

   if (livestreamMode === LivestreamModes.PRESENTATION) {
      return <>Rendering PDF</>
   }
   if (livestreamMode === LivestreamModes.VIDEO) {
      return <>Rendering YouTube Video</>
   }

   return null
}

const SpotlightStream = () => {
   const { stream } = useSpotlight()

   if (!stream) {
      return <Box>Please wait while the host is setting up the stream</Box>
   }

   return <UserStreamComponent user={stream} />
}
