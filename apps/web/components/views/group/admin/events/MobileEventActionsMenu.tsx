import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { FeedbackIcon } from "components/views/common/icons/FeedbackIcon"
import { ShareArrowIconOutlined } from "components/views/common/icons/ShareArrowIconOutlined"
import { MobileDrawer } from "components/views/common/inputs/BrandedResponsiveMenu"
import { useMemo } from "react"
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
import { getEventActionConditions } from "./eventActionConditions"

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

   const isDraft = Boolean(stat?.livestream.isDraft)
   const isPastEvent = checkIfPast(stat?.livestream)
   const hasRecordingAvailable = !stat?.livestream.denyRecordingAccess

   const {
      shouldShowEdit,
      shouldShowEnterLiveStreamRoom,
      shouldShowShareLiveStream,
      shouldShowViewRecording,
      shouldShowShareRecording,
      shouldShowAnalytics,
      shouldShowQuestions,
      shouldShowFeedback,
      shouldShowDelete,
   } = getEventActionConditions({
      isDraft,
      isPastEvent,
      hasRecordingAvailable,
   })

   const menuOptions = useMemo(() => {
      const options = []

      // For Draft events
      if (shouldShowEdit) {
         const editLabel = isDraft
            ? "Edit draft"
            : isPastEvent
            ? "Edit recording"
            : "Edit live stream"

         options.push({
            label: editLabel,
            icon: <Edit2 size={18} />,
            handleClick: () => handleEdit(stat),
         })
      }

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
            icon: <Eye size={18} />,
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
            icon: <BarChart2 size={18} />,
            handleClick: () => handleAnalytics(stat),
         })
      }

      if (shouldShowQuestions) {
         options.push({
            label: "Questions",
            icon: <MessageSquare size={18} />,
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

      // Delete action (always available with different labels)
      if (shouldShowDelete) {
         const deleteLabel = isDraft
            ? "Delete draft"
            : isPastEvent
            ? "Delete recording"
            : "Delete live stream"

         options.push({
            label: deleteLabel,
            icon: <Trash2 size={18} />,
            color: "#FF1616",
            handleClick: () => handleDelete(stat),
         })
      }

      return options
   }, [
      stat,
      isDraft,
      isPastEvent,
      shouldShowEdit,
      shouldShowEnterLiveStreamRoom,
      shouldShowShareLiveStream,
      shouldShowViewRecording,
      shouldShowShareRecording,
      shouldShowAnalytics,
      shouldShowQuestions,
      shouldShowFeedback,
      shouldShowDelete,
      handleEdit,
      handleEnterLiveStreamRoom,
      handleShareLiveStream,
      handleShareRecording,
      handleViewRecording,
      handleAnalytics,
      handleQuestions,
      handleFeedback,
      handleDelete,
   ])

   return <MobileDrawer open={open} options={menuOptions} onClose={onClose} />
}
