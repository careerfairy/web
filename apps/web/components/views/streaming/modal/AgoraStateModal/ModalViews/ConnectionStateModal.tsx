import React, { FC, useEffect, useState } from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import {
   CircularProgress,
   Collapse,
   DialogTitle,
   Stack,
   Typography,
} from "@mui/material"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import { useSelector } from "react-redux"
import { rtcMessages } from "types/streaming"
import OptionCard, { OptionCardProps } from "../common/OptionCard"
import { RTC_CLIENT_RECONNECT_LIMIT } from "constants/streams"
import { rtcConnectionStateSelector } from "../../../../../../store/selectors/streamSelectors"

interface Props {
   steps: OptionCardProps[]
}

const loadingTimeLimit = RTC_CLIENT_RECONNECT_LIMIT
const ConnectionStateModal: FC<Props> = (props) => {
   const [showDebugPrompt, setShowDebugPrompt] = useState(false)

   const agoraRtcConnectionStatus = useSelector(rtcConnectionStateSelector)

   useEffect(() => {
      let mounted = true

      const { curState } = agoraRtcConnectionStatus
      let timeout
      const inALoadingState = [
         "CONNECTING",
         "RECONNECTING",
         "DISCONNECTED",
      ].includes(curState)

      if (agoraRtcConnectionStatus.curState === "DISCONNECTED") {
         setShowDebugPrompt(true)
         return
      }

      if (inALoadingState) {
         timeout = setTimeout(async () => {
            if (mounted) {
               setShowDebugPrompt(true)
            }
         }, loadingTimeLimit)
      } else {
         setShowDebugPrompt(false)
         if (timeout) {
            clearTimeout(timeout)
         }
      }

      return () => {
         mounted = false
         clearTimeout(timeout)
      }
   }, [agoraRtcConnectionStatus])

   return (
      <Dialog open={true}>
         <DialogTitle>
            <Stack alignItems="center" sx={{ py: 3 }} spacing={2}>
               {["CONNECTING", "RECONNECTING", "DISCONNECTING"].includes(
                  agoraRtcConnectionStatus.curState
               ) && <CircularProgress />}
               {agoraRtcConnectionStatus.curState === "DISCONNECTED" && (
                  <HighlightOffIcon color="error" fontSize="large" />
               )}
               <Typography variant="h6" align="center">
                  {rtcMessages[agoraRtcConnectionStatus.curState]}
               </Typography>
            </Stack>
         </DialogTitle>
         <Collapse in={showDebugPrompt}>
            <DialogContent dividers>
               <Stack spacing={2}>
                  <Typography variant="h6">
                     {"We're "} having trouble connecting you with CareerFairy:
                  </Typography>
                  {props.steps.map((step) => (
                     <OptionCard {...step} key={step.title} />
                  ))}
               </Stack>
            </DialogContent>
         </Collapse>
      </Dialog>
   )
}

export default ConnectionStateModal
