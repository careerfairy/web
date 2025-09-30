import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Box } from "@mui/material"
import { getGroupOfflineEventsWithStatsKey } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { SlideUpTransition } from "components/views/common/transitions"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback } from "react"
import { Trash2 as DeleteIcon } from "react-feather"
import { useSWRConfig } from "swr"
import { capitalizeFirstLetter } from "util/CommonUtil"
import ConfirmationDialog from "../../../../../../materialUI/GlobalModals/ConfirmationDialog"
import { useDeleteOfflineEvent } from "../../../../../custom-hook/offline-event/useDeleteOfflineEvent"
import {
   getEventTypeName,
   getOfflineEventStatus,
} from "../offline-events-table/utils"

type Props = {
   open: boolean
   offlineEvent: OfflineEvent | null
   onClose: () => void
}

export const DeleteOfflineEventDialog = ({
   open,
   offlineEvent,
   onClose,
}: Props) => {
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { group } = useGroup()
   const { mutate } = useSWRConfig()

   const { trigger: deleteOfflineEvent, isMutating: isDeleting } =
      useDeleteOfflineEvent({
         offlineEventId: offlineEvent?.id,
         groupId: group?.id,
      })

   const eventStatus = offlineEvent ? getOfflineEventStatus(offlineEvent) : null
   const eventType = getEventTypeName(eventStatus)

   const handleConfirm = useCallback(async () => {
      if (!offlineEvent) return

      try {
         await deleteOfflineEvent()
         // Force refetch of offline events with stats
         mutate(getGroupOfflineEventsWithStatsKey(group?.id))

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
               collection: "offlineEvents",
               eventId: offlineEvent?.id,
            }
         )
      }
   }, [
      offlineEvent,
      deleteOfflineEvent,
      mutate,
      group?.id,
      onClose,
      successNotification,
      eventType,
      errorNotification,
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
