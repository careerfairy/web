import { FC, useState } from "react"
import { Box } from "@mui/material"
import { AbstractButtonSelect } from "../util"
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
import CFLineChart from "../components/charts/CFLineChart"

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

   const steps = [
      <Box key={0} height={394}>
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
      </Box>,
      <Box key={1} height={394}>
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
      </Box>,
      <Box key={2} height={394}>
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
      </Box>,
      <Box key={3} height={394}>
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
      </Box>,
   ]

   return (
      <>
         {isMobile ? (
            <GroupSparkAnalyticsCardContainer>
               <BrandedSwipeableViews steps={steps} />
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

export default EngagementAnalyticsContainer
