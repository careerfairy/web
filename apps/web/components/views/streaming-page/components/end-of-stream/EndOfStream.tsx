import { MESSAGING_TYPE } from "@careerfairy/shared-lib/messaging"
import { Box, BoxProps, Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { ReactNode, forwardRef, useEffect } from "react"
import {
   useIsRecordingWindow,
   useShowEndScreen,
   useStreamHasJobs,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { MobileUtils } from "util/mobile.utils"
import { EndOfStreamHeader } from "./EndOfStreamHeader"
import { Hero } from "./Hero"
import { Jobs } from "./Jobs"
import { Sparks } from "./Sparks"
import { NextStreams, RecommendedStreams } from "./Streams"

const styles = sxStyles({
   root: {
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      pb: 4.5,
      bgcolor: "#F7F8FC",
   },
   contentContainer: {
      alignItems: "center",
   },
})

type Props = {
   children: ReactNode
   isHost: boolean
}

/**
 * EndOfStream component determines whether to show the end of stream view or the children components
 * based on the host status and the state of the live stream.
 *
 * The end of stream is shown if the user is not the host, the live stream has ended and has not started yet.
 */
export const EndOfStream = ({ children, isHost }: Props) => {
   const showEndScreen = useShowEndScreen(isHost)

   useEffect(() => {
      if (showEndScreen) {
         MobileUtils.send(MESSAGING_TYPE.FEEDBACK_PROMPT, null)
      }
   }, [showEndScreen])

   if (showEndScreen) {
      return <EndOfStreamView />
   }

   return <>{children}</>
}

const EndOfStreamView = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
   const hasJobs = useStreamHasJobs()
   const { isLoggedIn } = useAuth()
   const isRecordingWindow = useIsRecordingWindow()

   return (
      <Box ref={ref} {...props} sx={styles.root}>
         <EndOfStreamHeader />
         <Hero />
         {!isRecordingWindow && (
            <Stack sx={styles.contentContainer} spacing={3}>
               {Boolean(hasJobs) && <Jobs />}
               {isLoggedIn ? <RecommendedStreams /> : <NextStreams />}
               <Sparks />
            </Stack>
         )}
      </Box>
   )
})

EndOfStreamView.displayName = "EndOfStreamView"
