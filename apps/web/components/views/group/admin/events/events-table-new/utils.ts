import { LivestreamEventPublicData } from "@careerfairy/shared-lib/livestreams/livestreams"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import DateUtil from "util/DateUtil"
import { checkIfPast } from "../../../../../../util/streamUtil"

export enum LivestreamEventStatus {
   /** Event is scheduled for the future */
   UPCOMING = "upcoming",
   /** Event is in draft state, not published */
   DRAFT = "draft",
   /** Event has ended and recording is available */
   RECORDING = "recording",
   /** Event has ended and recording is not available */
   NOT_RECORDED = "not-recorded",
}

export const getLivestreamEventStatus = (
   event: LivestreamEventPublicData
): LivestreamEventStatus => {
   // Priority order: draft, upcoming, recorded, not recorded

   // 1. Check if it's a draft first
   if (event.isDraft) {
      return LivestreamEventStatus.DRAFT
   }

   // 2. Check if it's an upcoming event
   if (!checkIfPast(event)) {
      return LivestreamEventStatus.UPCOMING
   }

   // 3. Check if recording access is denied (not recorded)
   if (event.denyRecordingAccess) {
      return LivestreamEventStatus.NOT_RECORDED
   }

   // 4. Default to recording (past events that allow recording)
   return LivestreamEventStatus.RECORDING
}

export const getEventTypeName = (status: LivestreamEventStatus) => {
   switch (status) {
      case LivestreamEventStatus.DRAFT:
         return "draft"
      case LivestreamEventStatus.UPCOMING:
         return "live stream"
      case LivestreamEventStatus.RECORDING:
      case LivestreamEventStatus.NOT_RECORDED:
         return "recording"
      default:
         return "live stream"
   }
}

export const getEventDate = (stat: LiveStreamStats): string => {
   if (!stat.livestream.start) {
      return "-"
   }

   return DateUtil.formatEventDate(stat.livestream.start.toDate())
}

/**
 * Centralized logic for determining which actions should be available for an event
 * Based on the conditions from EventCardPreview.tsx and HoverActionIcons.tsx
 */
export const getEventActionConditions = (
   status: LivestreamEventStatus | null
) => {
   if (!status) {
      return {}
   }

   return {
      /** Only for Upcoming Live Streams (not Draft, not Past) */
      shouldShowEnterLiveStreamRoom: status === LivestreamEventStatus.UPCOMING,
      /** Only for Upcoming Live Streams (not Draft, not Past) */
      shouldShowShareLiveStream: status === LivestreamEventStatus.UPCOMING,
      /** Visible for all except Drafts */
      shouldShowAnalytics: status !== LivestreamEventStatus.DRAFT,
      /** Visible for all except Drafts */
      shouldShowQuestions: status !== LivestreamEventStatus.DRAFT,
      /** Only for Past events (not Draft) */
      shouldShowFeedback:
         status === LivestreamEventStatus.RECORDING ||
         status === LivestreamEventStatus.NOT_RECORDED,
      /** Only for Past events with recording available (not Draft) */
      shouldShowShareRecording: status === LivestreamEventStatus.RECORDING,
      /** Only for Past events with recording available (not Draft) */
      shouldShowViewRecording: status === LivestreamEventStatus.RECORDING,
      /** Available for all states (with different labels) */
      shouldShowDelete: true,
   }
}

/**
 * Centralized logic for determining the view value to display
 * Based on event status and recording views data
 */
export const getViewValue = (
   eventStatus: LivestreamEventStatus,
   totalViews: number,
   loading: boolean,
   numberOfParticipants: number = 0
): string | number => {
   if (eventStatus !== LivestreamEventStatus.RECORDING) return "-"
   if (loading) return "..."

   return (totalViews || 0) + (numberOfParticipants || 0)
}
