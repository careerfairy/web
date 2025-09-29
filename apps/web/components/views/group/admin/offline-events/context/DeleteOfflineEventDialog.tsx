import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

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
   console.log("🚀 ~ DeleteOfflineEventDialog ~ open:", open)
   const { group } = useGroup()
   const { push } = useRouter()
   const [isDeleting, setIsDeleting] = useState(false)
   console.log("🚀 ~ DeleteOfflineEventDialog ~ isDeleting:", isDeleting)

   const handleDelete = useCallback(async () => {
      if (!offlineEvent || !group) return

      try {
         setIsDeleting(true)

         // Delete the offline event
         await offlineEventService.deleteOfflineEvent(offlineEvent.id)

         // Decrease the available offline events count
         await offlineEventService.decreaseGroupAvailableOfflineEvents(group.id)

         // Close dialog and navigate back to offline events list
         onClose()
         push(`/group/${group.id}/admin/content/offline-events`)
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to delete offline event",
            offlineEventId: offlineEvent.id,
         })
      } finally {
         setIsDeleting(false)
      }
   }, [offlineEvent, group, onClose, push])
   console.log("🚀 ~ DeleteOfflineEventDialog ~ handleDelete:", handleDelete)

   return <></>
}
