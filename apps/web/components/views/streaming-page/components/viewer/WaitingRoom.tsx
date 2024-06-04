import { Box, BoxProps, Container } from "@mui/material"
import Slide from "@mui/material/Slide"
import { Fragment, ReactNode, forwardRef } from "react"
import { useShowWaitingRoom } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { CountDown } from "./CountDown"
import { Footer } from "./Footer"
import { HostDetails } from "./HostDetails"
import { StatusTitle } from "./StatusTitle"
import { TopBar } from "./TopBar"

const styles = sxStyles({
   waitingRoom: {
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      my: "auto",
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
   return (
      <Box ref={ref} {...props} sx={styles.waitingRoom}>
         <TopBar />
         <Container maxWidth={false} disableGutters sx={styles.container}>
            <HostDetails />
            <StatusTitle />
            <CountDown />
         </Container>
         <Footer />
      </Box>
   )
})

WaitingRoomView.displayName = "WaitingRoomView"
