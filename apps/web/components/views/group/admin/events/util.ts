import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"

export const getEventStatsKey = (stat: LiveStreamStats) => {
   return `${stat.livestream.id}-${
      stat.livestream.isDraft ? "draft" : "published"
   }`
}
