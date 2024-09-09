import { EngagementData } from "@careerfairy/shared-lib/sparks/analytics"
import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useState } from "react"
import { numberToString } from "util/CommonUtil"
import BrandedSwipeableViews from "../components/BrandedSwipeableViews"
import CFLineChart from "../components/charts/CFLineChart"
import ChartSwitchButton from "../components/charts/ChartSwitchButton"
import ChartSwitchButtonGroupContainer from "../components/ChartSwitchButtonGroupContainer"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import {
   AbstractButtonSelect,
   timeFrameLabels,
   useResetChartsTooltip,
} from "../util"

const engagementSelectOptions: AbstractButtonSelect<EngagementData> = {
   likes: "Likes",
   shares: "Shares",
   registrations: "Registrations",
   pageClicks: "Clicks",
} as const

export const EngagementAnalyticsContainer = () => {
   const isMobile = useIsMobile()
   const {
      filteredAnalytics: { engagement },
      selectTimeFilter,
   } = useSparksAnalytics()
   const resetChartsTooltip = useResetChartsTooltip()

   const [engagementSelectValue, setEngagementSelectValue] =
      useState<keyof EngagementData>("likes")

   const totalLikesCount = engagement.likes.totalCount
   const totalSharesCount = engagement.shares.totalCount
   const totalRegistrationsCount = engagement.registrations.totalCount
   const totalPageClicksCount = engagement.pageClicks.totalCount

   const timeFrameLabel = timeFrameLabels[selectTimeFilter]

   return (
      <>
         {isMobile ? (
            <GroupSparkAnalyticsCardContainer>
               <BrandedSwipeableViews onStepChange={resetChartsTooltip}>
                  <>
                     <GroupSparkAnalyticsCardContainerTitle>
                        {`${numberToString(
                           totalLikesCount
                        )} likes over the ${timeFrameLabel}`}
                     </GroupSparkAnalyticsCardContainerTitle>
                     <CFLineChart
                        tooltipLabel={engagementSelectOptions.likes}
                        xAxis={engagement.likes.xAxis}
                        series={engagement.likes.series}
                     />
                  </>
                  <>
                     <GroupSparkAnalyticsCardContainerTitle>
                        {`${numberToString(
                           totalSharesCount
                        )} shares over the ${timeFrameLabel}`}
                     </GroupSparkAnalyticsCardContainerTitle>
                     <CFLineChart
                        tooltipLabel={engagementSelectOptions.shares}
                        xAxis={engagement.shares.xAxis}
                        series={engagement.shares.series}
                     />
                  </>
                  <>
                     <GroupSparkAnalyticsCardContainerTitle>
                        {`${numberToString(
                           totalRegistrationsCount
                        )} registrations over the ${timeFrameLabel}`}
                     </GroupSparkAnalyticsCardContainerTitle>
                     <CFLineChart
                        tooltipLabel={engagementSelectOptions.registrations}
                        xAxis={engagement.registrations.xAxis}
                        series={engagement.registrations.series}
                     />
                  </>
                  <>
                     <GroupSparkAnalyticsCardContainerTitle>
                        {`${numberToString(
                           totalPageClicksCount
                        )} page clicks over the ${timeFrameLabel}`}
                     </GroupSparkAnalyticsCardContainerTitle>
                     <CFLineChart
                        tooltipLabel={engagementSelectOptions.pageClicks}
                        xAxis={engagement.pageClicks.xAxis}
                        series={engagement.pageClicks.series}
                     />
                  </>
               </BrandedSwipeableViews>
            </GroupSparkAnalyticsCardContainer>
         ) : (
            <GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainerTitle>
                  {`Engagement over the ${timeFrameLabel}`}
               </GroupSparkAnalyticsCardContainerTitle>
               <ChartSwitchButtonGroupContainer>
                  <ChartSwitchButton
                     label={"Likes"}
                     value={numberToString(totalLikesCount)}
                     active={engagementSelectValue === "likes"}
                     onClick={() => setEngagementSelectValue("likes")}
                  />
                  <ChartSwitchButton
                     label={"Shares"}
                     value={numberToString(totalSharesCount)}
                     active={engagementSelectValue === "shares"}
                     onClick={() => setEngagementSelectValue("shares")}
                  />
                  <ChartSwitchButton
                     label={"Registrations"}
                     value={numberToString(totalRegistrationsCount)}
                     active={engagementSelectValue === "registrations"}
                     onClick={() => setEngagementSelectValue("registrations")}
                  />
                  <ChartSwitchButton
                     label={"Page clicks"}
                     value={numberToString(totalPageClicksCount)}
                     active={engagementSelectValue === "pageClicks"}
                     onClick={() => setEngagementSelectValue("pageClicks")}
                  />
               </ChartSwitchButtonGroupContainer>
               <Box>
                  <CFLineChart
                     tooltipLabel={
                        engagementSelectOptions[engagementSelectValue]
                     }
                     xAxis={engagement[engagementSelectValue].xAxis}
                     series={engagement[engagementSelectValue].series}
                  />
               </Box>
            </GroupSparkAnalyticsCardContainer>
         )}
      </>
   )
}
