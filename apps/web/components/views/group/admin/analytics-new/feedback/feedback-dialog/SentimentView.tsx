import {
   SENTIMENT_EMOJIS,
   SENTIMENT_LABELS,
} from "../../../events/detail/form/views/questions/commons"
import { FeedbackStatsView } from "./FeedbackStatsView"

type SentimentViewProps = {
   stats: Record<number, number>
   total: number
}

export const SentimentView = ({ stats, total }: SentimentViewProps) => {
   // Find most voted
   let mostVotedVal = 0
   let maxVotes = -1
   Object.entries(stats).forEach(([val, count]) => {
      if (count > maxVotes) {
         maxVotes = count
         mostVotedVal = parseInt(val)
      }
   })

   const mostVotedEmoji =
      SENTIMENT_EMOJIS[mostVotedVal as keyof typeof SENTIMENT_EMOJIS] || "—"

   return (
      <FeedbackStatsView
         stats={stats}
         total={total}
         summaryTitle="Most voted"
         summaryValue={mostVotedEmoji}
         getItemLabel={(val) =>
            SENTIMENT_EMOJIS[val as keyof typeof SENTIMENT_EMOJIS]
         }
         getItemTooltip={(val) =>
            SENTIMENT_LABELS[val as keyof typeof SENTIMENT_LABELS]
         }
      />
   )
}
