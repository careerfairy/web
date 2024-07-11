import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useCallback, useState } from "react"
import {
   useHasStarted,
   useStartsAt,
} from "store/selectors/streamingAppSelectors"
import { BrandedTooltip } from "../BrandedTooltip"
import { ResponsiveStreamButton } from "../Buttons"
import {
   ConfirmDialogState,
   ToggleStartLiveStreamDialog,
} from "./ToggleStartLiveStreamDialog"
import useIsStreamStartingSoon from "./useIsStreamStartingSoon"

export const ToggleStartLiveStreamButton = () => {
   const hasStarted = useHasStarted()
   const startsAt = useStartsAt()

   const isMobile = useStreamIsMobile(390)

   const isStreamStartingSoon = useIsStreamStartingSoon(startsAt)
   const streamHasNoStartTime = !startsAt // Test streams currently have no start time

   const [dialogState, setDialogState] = useState<ConfirmDialogState>({
      isDialogOpen: false,
      intent: "start-streaming",
   })

   const shouldStop = dialogState.intent === "stop-streaming"

   const handleCloseDialog = useCallback(() => {
      setDialogState((prev) => ({ ...prev, isDialogOpen: false }))
   }, [])

   return (
      <>
         <BrandedTooltip
            placement="top"
            sx={{ maxWidth: "250px" }}
            title={
               isStreamStartingSoon || streamHasNoStartTime
                  ? ""
                  : "The Start Streaming button will become active 2 minutes before the stream's official start time."
            }
         >
            <span>
               <ResponsiveStreamButton
                  disabled={!(isStreamStartingSoon || streamHasNoStartTime)}
                  onClick={() =>
                     setDialogState({
                        isDialogOpen: true,
                        intent: hasStarted
                           ? "stop-streaming"
                           : "start-streaming",
                     })
                  }
                  color={hasStarted ? "error" : "primary"}
                  variant="contained"
               >
                  {hasStarted
                     ? isMobile
                        ? "Stop"
                        : "End live stream"
                     : isMobile
                     ? "Start"
                     : "Start live stream"}
               </ResponsiveStreamButton>
            </span>
         </BrandedTooltip>

         <ToggleStartLiveStreamDialog
            shouldStop={shouldStop}
            open={Boolean(dialogState.isDialogOpen)}
            handleCloseDialog={handleCloseDialog}
         />
      </>
   )
}
