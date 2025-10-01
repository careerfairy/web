import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import { ShareArrowIconOutlined } from "components/views/common/icons/ShareArrowIconOutlined"
import {
   MenuOption,
   MobileDrawer,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { useMemo, useRef } from "react"
import { BarChart2, Edit2, Trash2 } from "react-feather"
import { useOfflineEventsOverview } from "../context/OfflineEventsOverviewContext"
import { OfflineEventStatus, getOfflineEventStatus } from "./utils"

const HIDE_ANALYTICS_ON_MOBILE = true

type Props = {
   stat: OfflineEventsWithStats | null
   open: boolean
   onClose: () => void
}

export const OfflineEventMobileActionsMenu = ({
   stat,
   open,
   onClose,
}: Props) => {
   const {
      handleShareOfflineEvent,
      handleAnalytics,
      handleEdit,
      handleDelete,
   } = useOfflineEventsOverview()

   const eventStatus = stat ? getOfflineEventStatus(stat.offlineEvent) : null
   const isPublished = stat?.offlineEvent.published ?? false

   // Store the last calculated menu options to persist during closing animation
   const lastMenuOptionsRef = useRef<MenuOption[]>([])

   const menuOptions = useMemo(() => {
      const options: MenuOption[] = []

      // Share action - only for published events
      if (isPublished) {
         options.push({
            label: "Share offline event",
            icon: <ShareArrowIconOutlined />,
            handleClick: () => handleShareOfflineEvent(stat),
         })
      }

      // Analytics action - only for published events
      if (isPublished && !HIDE_ANALYTICS_ON_MOBILE) {
         options.push({
            label: "Analytics",
            icon: <BarChart2 />,
            handleClick: () => handleAnalytics(stat),
         })
      }

      // Edit action - always available
      const editLabel = getEditLabel(eventStatus)
      options.push({
         label: editLabel,
         icon: <Edit2 />,
         handleClick: () => handleEdit(stat),
      })

      // Delete action - always available
      const deleteLabel = getDeleteLabel(eventStatus)
      options.push({
         label: deleteLabel,
         icon: <Trash2 />,
         color: "error.main",
         handleClick: () => handleDelete(stat),
      })

      // Store the calculated options when drawer is open
      if (open) {
         lastMenuOptionsRef.current = options
      }

      // Return last calculated options to persist UI during closing animation
      return open ? options : lastMenuOptionsRef.current
   }, [
      stat,
      eventStatus,
      isPublished,
      handleShareOfflineEvent,
      handleAnalytics,
      handleEdit,
      handleDelete,
      open,
   ])

   return (
      <MobileDrawer
         disableSwipeToOpen
         open={open}
         options={menuOptions}
         onClose={onClose}
      />
   )
}

const getEditLabel = (eventStatus: OfflineEventStatus | null) => {
   switch (eventStatus) {
      case OfflineEventStatus.DRAFT:
         return "Edit draft event"
      case OfflineEventStatus.UPCOMING:
         return "Edit upcoming event"
      case OfflineEventStatus.PAST:
         return "Edit past event"
      default:
         return "Edit offline event"
   }
}

const getDeleteLabel = (eventStatus: OfflineEventStatus | null) => {
   switch (eventStatus) {
      case OfflineEventStatus.DRAFT:
         return "Delete draft event"
      case OfflineEventStatus.UPCOMING:
         return "Delete upcoming event"
      case OfflineEventStatus.PAST:
         return "Delete past event"
      default:
         return "Delete offline event"
   }
}
