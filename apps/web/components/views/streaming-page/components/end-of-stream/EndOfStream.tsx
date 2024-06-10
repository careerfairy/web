import { Box, BoxProps, Stack } from "@mui/material"
import { ReactNode, forwardRef } from "react"
import {
   useShowEndScreen,
   useStreamHasJobs,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { EndOfStreamHeader } from "./EndOfStreamHeader"
import { Hero } from "./Hero"
import { Jobs } from "./Jobs"
import { Streams } from "./Streams"

const styles = sxStyles({
   root: {
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      pb: 4.5,
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

   if (showEndScreen) {
      return <EndOfStreamView />
   }

   return <>{children}</>
}

const EndOfStreamView = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
   const hasJobs = useStreamHasJobs()

   return (
      <Box ref={ref} {...props} sx={styles.root}>
         <EndOfStreamHeader />
         <Hero />
         <Stack sx={styles.contentContainer} spacing={3}>
            {Boolean(hasJobs) && <Jobs />}
            <Streams />
         </Stack>
      </Box>
   )
})

EndOfStreamView.displayName = "EndOfStreamView"
