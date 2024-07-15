import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useDeleteLivestreamChatEntry } from "components/custom-hook/streaming/useDeleteLivestreamChatEntry"
import BrandedResponsiveMenu from "components/views/common/inputs/BrandedResponsiveMenu"
import { Trash2 as DeleteIcon } from "react-feather"
import { useStreamingContext } from "../../context"

type Props = {
   handleClose: () => void
   anchorEl: HTMLElement | null
   selectedEntryId: string | null
}

export const OptionsMenu = ({
   handleClose,
   anchorEl,
   selectedEntryId,
}: Props) => {
   const open = Boolean(anchorEl && selectedEntryId)

   const streamIsMobile = useStreamIsMobile()

   const { livestreamId, streamerAuthToken, agoraUserId } =
      useStreamingContext()
   const { trigger: deleteChatEntry, isMutating } =
      useDeleteLivestreamChatEntry(livestreamId, selectedEntryId)

   const options = [
      {
         label: "Delete message",
         icon: <DeleteIcon />,
         handleClick: () =>
            deleteChatEntry({
               agoraUserId,
               livestreamToken: streamerAuthToken,
            }),
         color: "error.main",
         loading: isMutating,
      },
   ]

   return (
      <BrandedResponsiveMenu
         options={options}
         open={open}
         handleClose={handleClose}
         anchorEl={anchorEl}
         isMobileOverride={streamIsMobile}
         enableDrawerCancelButton
      />
   )
}
