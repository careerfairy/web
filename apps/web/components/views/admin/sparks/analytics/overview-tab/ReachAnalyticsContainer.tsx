import { ReachData } from "@careerfairy/shared-lib/sparks/analytics"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useState } from "react"
import { numberToString } from "util/CommonUtil"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import BrandedSwipeableViews from "../components/BrandedSwipeableViews"
import ChartSwitchButtonGroupContainer from "../components/ChartSwitchButtonGroupContainer"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import CFLineChart from "../components/charts/CFLineChart"
import ChartSwitchButton from "../components/charts/ChartSwitchButton"
import {
   AbstractButtonSelect,
   timeFrameLabels,
   useResetChartsTooltip,
} from "../util"

const reachSelectOptions: AbstractButtonSelect<ReachData> = {
   totalViews: "Views",
   uniqueViewers: "Viewers",
} as const

export const ReachAnalyticsContainer = () => {
   const isMobile = useIsMobile()
   const {
      filteredAnalytics: { reach },
      selectTimeFilter,
   } = useSparksAnalytics()

   const resetChartsTooltip = useResetChartsTooltip()

   const [reachSelectValue, setReachSelectValue] =
      useState<keyof ReachData>("totalViews")

   const totalViewsCount = reach.totalViews.totalCount
   const totalUniqueViewersCount = reach.uniqueViewers.totalCount

   const timeFrameLabel = timeFrameLabels[selectTimeFilter]

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
