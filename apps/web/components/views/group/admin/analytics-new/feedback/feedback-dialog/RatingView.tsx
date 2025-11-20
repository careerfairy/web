import { FeedbackStatsView } from "./FeedbackStatsView"

const RATING_LABELS = {
   1: "Very unsatisfied",
   2: "Unsatisfied",
   3: "Neutral",
   4: "Satisfied",
   5: "Very satisfied",
}

type RatingViewProps = {
   stats: Record<number, number>
   average: number
   total: number
}

export const RatingView = ({ stats, average, total }: RatingViewProps) => {
   return (
      <FeedbackStatsView
         stats={stats}
         total={total}
         summaryTitle="Average rating"
         summaryValue={average.toFixed(1)}
         getItemLabel={(val) => val}
         getItemTooltip={(val) =>
            RATING_LABELS[val as keyof typeof RATING_LABELS]
         }
      />
   )
}
