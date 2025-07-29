import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { FeedbackIcon } from "components/views/common/icons/FeedbackIcon"
import { ShareArrowIconOutlined } from "components/views/common/icons/ShareArrowIconOutlined"
import {
   MenuOption,
   MobileDrawer,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { useMemo, useRef } from "react"
import {
   BarChart2,
   Edit2,
   ExternalLink,
   Eye,
   MessageSquare,
   Trash2,
} from "react-feather"
import { checkIfPast } from "../../../../../util/streamUtil"
import { useEventsView } from "./context/EventsViewContext"
import { getEventActionConditions } from "./events-table-new/utils"

type Props = {
   stat: LiveStreamStats | null
   open: boolean
   onClose: () => void
}

export const MobileEventActionsMenu = ({ stat, open, onClose }: Props) => {
   const {
      handleEdit,
      handleEnterLiveStreamRoom,
      handleShareLiveStream,
      handleShareRecording,
      handleViewRecording,
      handleAnalytics,
      handleQuestions,
      handleFeedback,
      handleDelete,
   } = useEventsView()

   const isDraft = Boolean(stat?.livestream?.isDraft)
   const isPastEvent = stat?.livestream ? checkIfPast(stat.livestream) : false
   const hasRecordingAvailable = stat?.livestream
      ? !stat.livestream.denyRecordingAccess
      : false

   const {
      shouldShowEnterLiveStreamRoom,
      shouldShowShareLiveStream,
      shouldShowViewRecording,
      shouldShowShareRecording,
      shouldShowAnalytics,
      shouldShowQuestions,
      shouldShowFeedback,
   } = getEventActionConditions({
      isDraft,
      isPastEvent,
      hasRecordingAvailable,
   })

   // Store the last calculated menu options to persist during closing animation
   const lastMenuOptionsRef = useRef<MenuOption[]>([])

   const menuOptions = useMemo(() => {
      const options: MenuOption[] = []

      // For Upcoming/Published events
      if (shouldShowEnterLiveStreamRoom) {
         options.push({
            label: "Enter live stream room",
            icon: <ExternalLink size={18} />,
            handleClick: () => handleEnterLiveStreamRoom(stat),
         })
      }

      if (shouldShowShareLiveStream) {
         options.push({
            label: "Share live stream",
            icon: <ShareArrowIconOutlined />,
            handleClick: () => handleShareLiveStream(stat),
         })
      }

      // For Past events
      if (shouldShowViewRecording) {
         options.push({
            label: "View recording",
            icon: <Eye />,
            handleClick: () => handleViewRecording(stat),
         })
      }

      if (shouldShowShareRecording) {
         options.push({
            label: "Share recording",
            icon: <ShareArrowIconOutlined />,
            handleClick: () => handleShareRecording(stat),
         })
      }

      // Common actions for non-draft events
      if (shouldShowAnalytics) {
         options.push({
            label: "Analytics",
            icon: <BarChart2 />,
            handleClick: () => handleAnalytics(stat),
         })
      }

      if (shouldShowQuestions) {
         options.push({
            label: "Questions",
            icon: <MessageSquare />,
            handleClick: () => handleQuestions(stat),
         })
      }

      if (shouldShowFeedback) {
         options.push({
            label: "Feedback",
            icon: <FeedbackIcon />,
            handleClick: () => handleFeedback(stat),
         })
      }

      // For All events
      const editLabel = isDraft
         ? "Edit draft"
         : isPastEvent
         ? "Edit recording"
         : "Edit live stream"

      options.push({
         label: editLabel,
         icon: <Edit2 />,
         handleClick: () => handleEdit(stat),
      })

      // Delete action (always available with different labels)
      const deleteLabel = isDraft
         ? "Delete draft"
         : isPastEvent
         ? "Delete recording"
         : "Delete live stream"

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
      isDraft,
      isPastEvent,
      shouldShowEnterLiveStreamRoom,
      shouldShowShareLiveStream,
      shouldShowViewRecording,
      shouldShowShareRecording,
      shouldShowAnalytics,
      shouldShowQuestions,
      shouldShowFeedback,
      handleEdit,
      handleEnterLiveStreamRoom,
      handleShareLiveStream,
      handleShareRecording,
      handleViewRecording,
      handleAnalytics,
      handleQuestions,
      handleFeedback,
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
