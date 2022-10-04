import React, { ComponentProps, FC, useEffect, useState } from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import {
   CircularProgress,
   Collapse,
   DialogTitle,
   Divider,
   Stack,
   Typography,
} from "@mui/material"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import { useSelector } from "react-redux"
import { rtcMessages } from "types/streaming"
import { RTC_CLIENT_RECONNECT_LIMIT } from "constants/streams"
import { rtcConnectionStateSelector } from "../../../../../../store/selectors/streamSelectors"
import { sxStyles } from "../../../../../../types/commonTypes"
import ResourcesView, { dummyResources } from "../common/ResourcesView"
import StepsView, { StepCard } from "../common/StepsView"
import FaqView, { dummyFaqElements } from "../common/FaqView"

interface Props {
   steps: ComponentProps<typeof StepCard>[]
}

const styles = sxStyles({
   divider: {
      mx: (theme) => `${theme.spacing(5)} !important`,
      bgcolor: "none",
      borderBottom: (theme) => `2px solid ${theme.palette.tertiary.main}`,
   },
})

const loadingTimeLimit = RTC_CLIENT_RECONNECT_LIMIT
const ConnectionStateModal: FC<Props> = ({ steps }) => {
   const [showDebugPrompt, setShowDebugPrompt] = useState(false)

   const agoraRtcConnectionStatus = useSelector(rtcConnectionStateSelector)

   const inALoadingState = [
      "CONNECTING",
      "RECONNECTING",
      "DISCONNECTED",
   ].includes(agoraRtcConnectionStatus.curState)

   useEffect(() => {
      let mounted = true

      let timeout

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
   }, [agoraRtcConnectionStatus, inALoadingState])

   return (
      <Dialog open={true}>
         <DialogTitle>
            <Stack alignItems="center" sx={{ py: 2 }} spacing={2}>
               {inALoadingState && <CircularProgress />}
               {agoraRtcConnectionStatus.curState === "DISCONNECTED" && (
                  <HighlightOffIcon color="error" fontSize="large" />
               )}
               <Typography variant="h6" align="center">
                  {rtcMessages[agoraRtcConnectionStatus.curState]}
               </Typography>
            </Stack>
         </DialogTitle>
         <DialogContent>
            <Collapse in={showDebugPrompt}>
               <Typography align={"center"} variant="h5">
                  {"We're "} having trouble connecting you with CareerFairy:
               </Typography>
               <Stack
                  divider={<Divider variant={"middle"} sx={styles.divider} />}
                  spacing={2}
               >
                  <StepsView steps={steps} />
                  <ResourcesView options={dummyResources} />
                  <FaqView faqElements={dummyFaqElements} />
               </Stack>
            </Collapse>
         </DialogContent>
      </Dialog>
   )
}

export default ConnectionStateModal
