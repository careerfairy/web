import { StartStreamIcon, StopStreamIcon } from "components/views/common/icons"
import { ResponsiveStreamButton } from "../Buttons"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useCallback, useState } from "react"
import {
   useHasStarted,
   useStartsAt,
} from "store/selectors/streamingAppSelectors"
import { useUpdateLivestreamStartEndState } from "components/custom-hook/streaming/useUpdateLivestreamStartEndState"
import { useStreamingContext } from "../../context"
import useIsStreamStartingSoon from "./useIsStreamStartingSoon"
import { Tooltip } from "@mui/material"

type ConfirmDialogState = {
   isDialogOpen: boolean
   intent: "start-streaming" | "stop-streaming"
}

export const ToggleStartLiveStreamButton = () => {
   const hasStarted = useHasStarted()
   const startsAt = useStartsAt()
   const { livestreamId } = useStreamingContext()

   const { trigger: updateLivestreamStartEndState, isMutating } =
      useUpdateLivestreamStartEndState(livestreamId)

   const isMobile = useStreamIsMobile(390)

   const isStreamStartingSoon = useIsStreamStartingSoon(startsAt)

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
         <Tooltip
            placement="top"
            title={
               isStreamStartingSoon
                  ? ""
                  : "The Start Streaming button will become active 2 minutes before the stream's official start time."
            }
         >
            <span>
               <ResponsiveStreamButton
                  disabled={!isStreamStartingSoon}
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
         </Tooltip>
         <ConfirmationDialog
            open={Boolean(dialogState.isDialogOpen)}
            title={shouldStop ? "End live stream" : "Start live stream"}
            description={
               shouldStop
                  ? "Are you sure you want to end your live stream? Your viewers will no longer be able to see or hear you."
                  : "Are you sure you want to start your live stream? Once you go live, your viewers will be able to see and hear you."
            }
            icon={shouldStop ? <StopStreamIcon /> : <StartStreamIcon />}
            secondaryAction={{
               text: "Cancel",
               color: "grey",
               callback: () => handleCloseDialog(),
               variant: "outlined",
               loading: isMutating,
            }}
            primaryAction={{
               text: shouldStop ? "End live stream" : "Start live stream",
               color: shouldStop ? "error" : "primary",
               callback: async () => {
                  await updateLivestreamStartEndState(!shouldStop)
                  handleCloseDialog()
               },
               variant: "contained",
               loading: isMutating,
            }}
         />
      </>
   )
}
