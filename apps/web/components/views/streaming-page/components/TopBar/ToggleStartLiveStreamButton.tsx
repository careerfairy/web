import { StartStreamIcon, StopStreamIcon } from "components/views/common/icons"
import { ResponsiveStreamButton } from "../Buttons"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useState } from "react"
import { useHasStarted } from "store/selectors/streamingAppSelectors"
import { useToggleStartLivestream } from "components/custom-hook/streaming/useToggleStartLivestream"
import { useStreamingContext } from "../../context"

type StreamerIntent = "start-streaming" | "stop-streaming" | null

export const ToggleStartLiveStreamButton = () => {
   const hasStarted = useHasStarted()
   const { livestreamId } = useStreamingContext()

   const [intent, setIntent] = useState<StreamerIntent>(null)

   const isMobile = useStreamIsMobile(390)

   const shouldStop = intent === "stop-streaming"

   const { trigger: toggleStartLivestream, isMutating } =
      useToggleStartLivestream(livestreamId, !shouldStop)

   return (
      <>
         <ResponsiveStreamButton
            onClick={() =>
               setIntent(hasStarted ? "stop-streaming" : "start-streaming")
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
         <ConfirmationDialog
            open={Boolean(intent)}
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
               callback: () => setIntent(null),
               variant: "outlined",
               loading: isMutating || !intent,
            }}
            primaryAction={{
               text: shouldStop ? "End live stream" : "Start live stream",
               color: shouldStop ? "error" : "primary",
               callback: async () => {
                  await toggleStartLivestream()
                  setIntent(null)
               },
               variant: "contained",
               loading: isMutating || !intent,
            }}
         />
      </>
   )
}
