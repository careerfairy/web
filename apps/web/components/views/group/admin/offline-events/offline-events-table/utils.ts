import {
   OfflineEvent,
   OfflineEventsWithStats,
} from "@careerfairy/shared-lib/offline-events/offline-events"

export enum OfflineEventStatus {
   /** Event is scheduled for the future */
   UPCOMING = "upcoming",
   /** Event is in draft state, not published */
   DRAFT = "draft",
   /** Event has ended */
   PAST = "past",
}

export const getOfflineEventStatus = (
   event: OfflineEvent
): OfflineEventStatus => {
   // 1. Check if it's a draft first (not published)
   if (!event.published) {
      return OfflineEventStatus.DRAFT
   }

   // 2. Check if it's an upcoming event (with null-safe date check)
   if (event.startAt?.toDate && event.startAt.toDate() > new Date()) {
      return OfflineEventStatus.UPCOMING
   }

   // 3. Default to past (published events that have passed or have no start date)
   return OfflineEventStatus.PAST
}

export const getEventTypeName = (status: OfflineEventStatus) => {
   switch (status) {
      case OfflineEventStatus.UPCOMING:
         return "Upcoming"
      case OfflineEventStatus.DRAFT:
         return "Draft"
      case OfflineEventStatus.PAST:
         return "Past"
      default:
         return "Unknown"
   }
}

export const getOfflineEventStatsKey = (
   stat: OfflineEventsWithStats
): string => {
   return `offline-event-${stat.offlineEvent.id}`
}
