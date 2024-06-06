import { Box, BoxProps, Stack } from "@mui/material"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import { ReactNode, forwardRef } from "react"
import { useShowEndScreen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { EndOfStreamHeader } from "./EndOfStreamHeader"
import { Hero } from "./Hero"
import { Jobs } from "./Jobs"

const styles = sxStyles({
   root: {
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
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
   const streamIsLandscape = useStreamIsLandscape()

   return (
      <Box ref={ref} {...props} sx={styles.root}>
         <EndOfStreamHeader />
         <Hero />
         <Box flexGrow={streamIsLandscape ? 0.35 : 1} />
         <Stack sx={styles.contentContainer} spacing={3}>
            <Jobs />
         </Stack>
      </Box>
   )
})

EndOfStreamView.displayName = "EndOfStreamView"
