import { Box, BoxProps } from "@mui/material"
import { Fragment, ReactNode, forwardRef } from "react"
import {
   useHasEnded,
   useHasStarted,
} from "store/selectors/streamingAppSelectors"
import Slide from "@mui/material/Slide"

type Props = {
   children: ReactNode
   isHost: boolean
}
export const WaitingRoom = ({ children, isHost }: Props) => {
   const hasStarted = useHasStarted()
   const hasEnded = useHasEnded()

   const showWaitingRoom = !isHost && !hasStarted && !hasEnded

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
      <Box width="100%" bgcolor="red" height="100vh" ref={ref} {...props}>
         WaitingRoom
      </Box>
   )
})

WaitingRoomView.displayName = "WaitingRoomView"
