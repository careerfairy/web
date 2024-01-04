import { FC } from "react"
import { Stack } from "@mui/material"
import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import ReachAnalyticsContainer from "./ReachAnalyticsContainer"
import EngagementAnalyticsContainer from "./EngagementAnalyticsContainer"
import MostSomethingAnalyticsContainer from "./MostSomethingAnalyticsContainer"
import { timeFrameLabels } from "../util"

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
