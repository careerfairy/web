import { LivestreamEventPublicData } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Box } from "@mui/material"
import { getGroupLivestreamsWithStatsKey } from "components/custom-hook/live-stream/useGroupLivestreamsWithStats"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { SlideUpTransition } from "components/views/common/transitions"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback } from "react"
import { Trash2 as DeleteIcon } from "react-feather"
import { useSWRConfig } from "swr"
import { capitalizeFirstLetter } from "util/CommonUtil"
import ConfirmationDialog from "../../../../../../materialUI/GlobalModals/ConfirmationDialog"
import { useDeleteLivestream } from "../../../../../custom-hook/streaming/useDeleteLivestream"
import {
   getEventTypeName,
   getLivestreamEventStatus,
} from "../events-table-new/utils"

type Props = {
   open: boolean
   livestream: LivestreamEventPublicData | null
   onClose: () => void
}

export const DeleteLivestreamDialog = ({
   open,
   livestream,
   onClose,
}: Props) => {
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { group } = useGroup()
   const { mutate } = useSWRConfig()

   const collection = livestream?.isDraft ? "draftLivestreams" : "livestreams"

   const { trigger: deleteLivestream, isMutating: isDeleting } =
      useDeleteLivestream({
         livestreamId: livestream?.id,
         collection,
         groupId: group?.id,
      })

   const eventStatus = livestream ? getLivestreamEventStatus(livestream) : null
   const eventType = getEventTypeName(eventStatus)

   const handleConfirm = useCallback(async () => {
      if (!livestream) return

      try {
         await deleteLivestream()
         // Force refetch of livestreams with stats
         mutate(getGroupLivestreamsWithStatsKey(group?.id))

         onClose()
         successNotification(
            `${capitalizeFirstLetter(eventType)} deleted successfully`
         )
      } catch (error) {
         errorNotification(
            error,
            `Unable to delete ${capitalizeFirstLetter(
               eventType
            )}. Please try again.`,
            {
               collection,
               eventId: livestream?.id,
            }
         )
      }
   }, [
      livestream,
      deleteLivestream,
      mutate,
      group?.id,
      onClose,
      successNotification,
      eventType,
      errorNotification,
      collection,
   ])

   return (
      <ConfirmationDialog
         open={open}
         handleClose={onClose}
         title={`Delete this ${eventType}?`}
         description={`This action is permanent. You will no longer be able to recover this ${eventType}`}
         icon={<Box component={DeleteIcon} color="error.main" />}
         hideCloseIcon
         mobileButtonsHorizontal
         primaryAction={{
            text: "Delete",
            callback: handleConfirm,
            color: "error",
            variant: "contained",
            loading: isDeleting,
            fullWidth: true,
         }}
         secondaryAction={{
            text: "Cancel",
            callback: onClose,
            variant: "outlined",
            color: "grey",
            fullWidth: true,
         }}
         TransitionComponent={SlideUpTransition}
      />
   )
}
