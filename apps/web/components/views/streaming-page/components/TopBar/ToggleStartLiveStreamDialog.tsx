import { useUpdateLivestreamStartEndState } from "components/custom-hook/streaming/useUpdateLivestreamStartEndState"
import { StartStreamIcon, StopStreamIcon } from "components/views/common/icons"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useStreamingContext } from "../../context"

export type ConfirmDialogState = {
   isDialogOpen: boolean
   intent: "start-streaming" | "stop-streaming"
}

type Props = {
   shouldStop: boolean
   open: boolean
   handleCloseDialog: () => void
}

export const ToggleStartLiveStreamDialog = ({
   shouldStop,
   open,
   handleCloseDialog,
}: Props) => {
   const { livestreamId } = useStreamingContext()

   const { trigger: updateLivestreamStartEndState, isMutating } =
      useUpdateLivestreamStartEndState(livestreamId)

   return (
      <ConfirmationDialog
         open={open}
         title={shouldStop ? "End live stream" : "Start live stream"}
         description={
            shouldStop
               ? "Are you sure you want to end your live stream? Your viewers will no longer be able to see or hear you and the other speakers."
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
   )
}
