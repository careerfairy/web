import { Box, BoxProps, Typography } from "@mui/material"
import { Fragment, ReactNode, forwardRef } from "react"
import {
   useHasEnded,
   useHasStarted,
} from "store/selectors/streamingAppSelectors"
import Slide from "@mui/material/Slide"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   waitingRoom: {
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
   },
})

type Props = {
   children: ReactNode
   isHost: boolean
}

export const WaitingRoom = ({ children, isHost }: Props) => {
   const hasStarted = useHasStarted()
   const hasEnded = useHasEnded()

   const showWaitingRoom = !isHost && !hasEnded && hasStarted === undefined

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
         <Typography variant="brandedH1">Waiting Room</Typography>
      </Box>
   )
})

WaitingRoomView.displayName = "WaitingRoomView"
