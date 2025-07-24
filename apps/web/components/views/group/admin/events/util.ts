import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"

/**
 * Generates unique key for livestream stats including draft status.
 * Drafts are transferred to livestream collection with same ID upon publishing.
 * Past publishing issues caused drafts to remain after publishing (should have been deleted).
 * Including isDraft ensures unique identification and prevents React rendering conflicts.
 */
export const getEventStatsKey = (stat: LiveStreamStats) => {
   return `${stat.livestream.id}-${
      stat.livestream.isDraft ? "draft" : "published"
   }`
}
