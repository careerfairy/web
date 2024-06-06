import { Box, BoxProps, Container } from "@mui/material"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import { ReactNode, forwardRef } from "react"
import { useShowWaitingRoom } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { Header } from "../../TopBar/Header"
import { LogoBackButton } from "../../TopBar/LogoBackButton"
import { CountDown } from "./CountDown"
import { Footer } from "./Footer"
import { HostDetails } from "./HostDetails"
import { StatusTitle } from "./StatusTitle"

const styles = sxStyles({
   root: {
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
})

type Props = {
   children: ReactNode
   isHost: boolean
}

/**
 * WaitingRoom component determines whether to show the waiting room view or the children components
 * based on the host status and the state of the live stream.
 *
 * The waiting room is shown if the user is not the host, the live stream has not ended,
 * and the live stream has not started yet.
 */
export const WaitingRoom = ({ children, isHost }: Props) => {
   const showWaitingRoom = useShowWaitingRoom(isHost)

   if (showWaitingRoom) {
      return <WaitingRoomView />
   }

   return <>{children}</>
}

const WaitingRoomView = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
   const streamIsLandscape = useStreamIsLandscape()

   return (
      <Box ref={ref} {...props} sx={styles.root}>
         <Header>
            <LogoBackButton />
         </Header>
         <Box flexGrow={streamIsLandscape ? 0.35 : 1} />
         <Container maxWidth={false} disableGutters sx={styles.container}>
            <HostDetails />
            <StatusTitle />
            <CountDown />
         </Container>
         <Box flexGrow={streamIsLandscape ? 0.65 : 1} />
         <Footer />
      </Box>
   )
})

WaitingRoomView.displayName = "WaitingRoomView"
