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
      /** Available for all states */
      shouldShowEdit: true,
      /** Available for all states (with different labels) */
      shouldShowDelete: true,
   }
}
