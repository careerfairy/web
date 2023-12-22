import { FC, useState } from "react"
import { Box } from "@mui/material"
import { AbstractButtonSelect } from "./util"
import {
   EngagementData,
   TimePeriodParams,
} from "@careerfairy/shared-lib/sparks/analytics"
import { numberToString } from "util/CommonUtil"
import { useGroup } from "layouts/GroupDashboardLayout"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import BrandedSwipeableViews from "../components/BrandedSwipeableViews"
import ChartSwitchButton from "../components/charts/ChartSwitchButton"
import ChartSwitchButtonGroupContainer from "../components/ChartSwitchButtonGroupContainer"
import { CFLineChart } from "../components/charts/CFLineChart"

const engagementSelectOptions: AbstractButtonSelect<EngagementData> = {
   likes: "Likes",
   shares: "Shares",
   registrations: "Registrations",
   pageClicks: "Clicks",
} as const

type EngagementAnalyticsContainerProps = {
   timeFilter: TimePeriodParams
   timeFrameLabel: string
}

const EngagementAnalyticsContainer: FC<EngagementAnalyticsContainerProps> = ({
   timeFilter,
   timeFrameLabel,
}) => {
   const isMobile = useIsMobile()
   const { group } = useGroup()
   const { engagement } = useSparksAnalytics(group.id)[timeFilter]

   const [engagementSelectValue, setEngagementSelectValue] =
      useState<keyof EngagementData>("likes")

   const totalLikesCount = engagement.likes.totalCount
   const totalSharesCount = engagement.shares.totalCount
   const totalRegistrationsCount = engagement.registrations.totalCount
   const totalPageClicksCount = engagement.pageClicks.totalCount

   return (
      <>
         {isMobile ? (
            <GroupSparkAnalyticsCardContainer>
               <BrandedSwipeableViews>
                  <>
                     <GroupSparkAnalyticsCardContainerTitle>
                        {`${numberToString(
                           totalLikesCount
                        )} likes for the ${timeFrameLabel}`}
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
                        )} shares for the ${timeFrameLabel}`}
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
                        )} registrations for the ${timeFrameLabel}`}
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
                        )} page clicks for the ${timeFrameLabel}`}
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
                  {`Engagement for the ${timeFrameLabel}`}
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

export default EngagementAnalyticsContainer
