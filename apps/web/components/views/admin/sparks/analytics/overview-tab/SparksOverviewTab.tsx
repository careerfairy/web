import { FC } from "react"
import { Stack } from "@mui/material"
import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import ReachAnalyticsContainer from "./ReachAnalyticsContainer"
import EngagementAnalyticsContainer from "./EngagementAnalyticsContainer"
import MostSomethingAnalyticsContainer from "./MostSomethingAnalyticsContainer"

type TimeFrameMapToLabels = {
   [key in TimePeriodParams]: string
}

const timeFrameLabels: TimeFrameMapToLabels = {
   "7days": "past 7 days",
   "30days": "past 30 days",
   "6months": "past 6 months",
   "1year": "last year",
} as const

type SparksOverviewTabProps = {
   timeFilter: TimePeriodParams
}

const SparksOverviewTab: FC<SparksOverviewTabProps> = ({ timeFilter }) => {
   return (
      <Stack spacing={5} marginBottom={10}>
         <ReachAnalyticsContainer
            timeFilter={timeFilter}
            timeFrameLabel={timeFrameLabels[timeFilter]}
         />
         <EngagementAnalyticsContainer
            timeFilter={timeFilter}
            timeFrameLabel={timeFrameLabels[timeFilter]}
         />
         <MostSomethingAnalyticsContainer timeFilter={timeFilter} />
      </Stack>
   )
}

export default SparksOverviewTab
