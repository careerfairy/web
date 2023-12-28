import { FC, useState } from "react"
import { AbstractButtonSelect, useResetChartsTooltip } from "../util"
import {
   ReachData,
   TimePeriodParams,
} from "@careerfairy/shared-lib/sparks/analytics"
import { numberToString } from "util/CommonUtil"
import { useGroup } from "layouts/GroupDashboardLayout"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import useIsMobile from "components/custom-hook/useIsMobile"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import ChartSwitchButton from "../components/charts/ChartSwitchButton"
import ChartSwitchButtonGroupContainer from "../components/ChartSwitchButtonGroupContainer"
import CFLineChart from "../components/charts/CFLineChart"
import BrandedSwipeableViews from "../components/BrandedSwipeableViews"

const reachSelectOptions: AbstractButtonSelect<ReachData> = {
   totalViews: "Views",
   uniqueViewers: "Viewers",
} as const

type ReachAnalyticsContainerProps = {
   timeFilter: TimePeriodParams
   timeFrameLabel: string
}

const ReachAnalyticsContainer: FC<ReachAnalyticsContainerProps> = ({
   timeFilter,
   timeFrameLabel,
}) => {
   const isMobile = useIsMobile()
   const { group } = useGroup()
   const { reach } = useSparksAnalytics(group.id)[timeFilter]
   const resetChartsTooltip = useResetChartsTooltip()

   const [reachSelectValue, setReachSelectValue] =
      useState<keyof ReachData>("totalViews")

   const totalViewsCount = reach.totalViews.totalCount
   const totalUniqueViewersCount = reach.uniqueViewers.totalCount

   return (
      <>
         {isMobile ? (
            <GroupSparkAnalyticsCardContainer>
               <BrandedSwipeableViews onStepChange={resetChartsTooltip}>
                  <>
                     <GroupSparkAnalyticsCardContainerTitle>
                        {`${numberToString(
                           totalViewsCount
                        )} views over the ${timeFrameLabel}`}
                     </GroupSparkAnalyticsCardContainerTitle>
                     <CFLineChart
                        tooltipLabel={reachSelectOptions.totalViews}
                        xAxis={reach.totalViews.xAxis}
                        series={reach.totalViews.series}
                     />
                  </>
                  <>
                     <GroupSparkAnalyticsCardContainerTitle>
                        {`${numberToString(
                           totalUniqueViewersCount
                        )} unique viewers over the ${timeFrameLabel}`}
                     </GroupSparkAnalyticsCardContainerTitle>
                     <CFLineChart
                        tooltipLabel={reachSelectOptions.uniqueViewers}
                        xAxis={reach.uniqueViewers.xAxis}
                        series={reach.uniqueViewers.series}
                     />
                  </>
               </BrandedSwipeableViews>
            </GroupSparkAnalyticsCardContainer>
         ) : (
            <GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainerTitle>
                  {`Reach over the ${timeFrameLabel}`}
               </GroupSparkAnalyticsCardContainerTitle>
               <ChartSwitchButtonGroupContainer>
                  <ChartSwitchButton
                     label={"Total views"}
                     value={numberToString(totalViewsCount)}
                     active={reachSelectValue === "totalViews"}
                     onClick={() => setReachSelectValue("totalViews")}
                  />
                  <ChartSwitchButton
                     label={"Unique viewers"}
                     value={numberToString(totalUniqueViewersCount)}
                     active={reachSelectValue === "uniqueViewers"}
                     onClick={() => setReachSelectValue("uniqueViewers")}
                  />
               </ChartSwitchButtonGroupContainer>
               <CFLineChart
                  tooltipLabel={reachSelectOptions[reachSelectValue]}
                  xAxis={reach[reachSelectValue].xAxis}
                  series={reach[reachSelectValue].series}
               />
            </GroupSparkAnalyticsCardContainer>
         )}
      </>
   )
}

export default ReachAnalyticsContainer
