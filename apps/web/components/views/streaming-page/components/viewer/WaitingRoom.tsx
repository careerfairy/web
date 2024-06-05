import { Box, BoxProps, Container } from "@mui/material"
import Slide from "@mui/material/Slide"
import { useStreamIsLandscape } from "components/custom-hook/streaming"
import { Fragment, ReactNode, forwardRef } from "react"
import { useShowWaitingRoom } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { Header } from "../TopBar/Header"
import { LogoBackButton } from "../TopBar/LogoBackButton"
import { CountDown } from "./CountDown"
import { Footer } from "./Footer"
import { HostDetails } from "./HostDetails"
import { StatusTitle } from "./StatusTitle"

const styles = sxStyles({
   waitingRoom: {
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

export const WaitingRoom = ({ children, isHost }: Props) => {
   const showWaitingRoom = useShowWaitingRoom(isHost)

   return (
      <Fragment>
         <Slide
            direction="left"
            in={!showWaitingRoom}
            mountOnEnter
            unmountOnExit
         >
            <Box>{children}</Box>
         </Slide>
         <Slide
            direction="right"
            in={showWaitingRoom}
            mountOnEnter
            unmountOnExit
         >
            <WaitingRoomView />
         </Slide>
      </Fragment>
   )
}

const WaitingRoomView = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
   const streamIsLandscape = useStreamIsLandscape()

   return (
      <Box ref={ref} {...props} sx={styles.waitingRoom}>
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
