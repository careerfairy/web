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

export const getEventDate = (stat: LiveStreamStats): string => {
   if (!stat.livestream.start) {
      return "No date"
   }

   return DateUtil.formatEventDate(stat.livestream.start.toDate())
}

/**
 * Centralized logic for determining which actions should be available for an event
 * Based on the conditions from EventCardPreview.tsx and HoverActionIcons.tsx
 */
export const getEventActionConditions = (props: {
   isDraft?: boolean
   isPastEvent?: boolean
   hasRecordingAvailable?: boolean
}) => {
   const {
      isDraft = false,
      isPastEvent = false,
      hasRecordingAvailable = false,
   } = props

   return {
      /** Only for Upcoming Live Streams (not Draft, not Past) */
      shouldShowEnterLiveStreamRoom: !isDraft && !isPastEvent,
      /** Only for Upcoming Live Streams (not Draft, not Past) */
      shouldShowShareLiveStream: !isDraft && !isPastEvent,
      /** Visible for all except Drafts */
      shouldShowAnalytics: !isDraft,
      /** Visible for all except Drafts */
      shouldShowQuestions: !isDraft,
      /** Only for Past events (not Draft) */
      shouldShowFeedback: !isDraft && isPastEvent,
      /** Only for Past events with recording available (not Draft) */
      shouldShowShareRecording:
         !isDraft && isPastEvent && hasRecordingAvailable,
      /** Only for Past events with recording available (not Draft) */
      shouldShowViewRecording: !isDraft && isPastEvent && hasRecordingAvailable,
      /** Available for all states (with different labels) */
      shouldShowDelete: true,
   }
}
