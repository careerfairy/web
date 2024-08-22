import {
   CompetitorAudienceSegments,
   SparkAnalyticsClientWithPastData,
   TimePeriodParams,
} from "@careerfairy/shared-lib/sparks/analytics"
import { Stack } from "@mui/material"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useState } from "react"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { TitleWithSelect } from "../components/TitleWithSelect"
import EmptyDataCheckerForMostSomething from "../overview-tab/EmptyDataCheckers"
import { StaticSparkCard } from "./StaticSparkCard"

type AudienceOption = {
   value: CompetitorAudienceSegments | "all"
   label: string
}

const AUDIENCE_OPTIOMS: AudienceOption[] = [
   {
      value: "all",
      label: "All audiences",
   },
   {
      value: "business-plus",
      label: "Business +",
   },
   {
      value: "engineering",
      label: "Engineering",
   },
   {
      value: "it-and-mathematics",
      label: "IT & Mathematics",
   },
   {
      value: "natural-sciences",
      label: "Natural sciences",
   },
   {
      value: "social-sciences",
      label: "Social sciences",
   },
]

type TopSparksByIndustryContainerProps = {
   timeFilter: TimePeriodParams
}

export const TopSparksByAudience = ({
   timeFilter,
}: TopSparksByIndustryContainerProps) => {
   const { group } = useGroup()
   const {
      topSparksByAudience,
   }: SparkAnalyticsClientWithPastData[TimePeriodParams] = useSparksAnalytics(
      group.id
   )[timeFilter]

   const [selectAudienceValue, setSelectAudienceValue] = useState<
      CompetitorAudienceSegments | "all"
   >("all")

   return (
      <GroupSparkAnalyticsCardContainer>
         <TitleWithSelect
            title="Top Sparks by audience:&nbsp;"
            selectedOption={selectAudienceValue}
            setSelectedOption={setSelectAudienceValue}
            options={AUDIENCE_OPTIOMS}
         />
         {topSparksByAudience[selectAudienceValue]?.length === 0 ? (
            <EmptyDataCheckerForMostSomething />
         ) : (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
               {topSparksByAudience[selectAudienceValue].map(
                  (sparkId, index) => (
                     <StaticSparkCard
                        key={`top-sparks-by-audience-${selectAudienceValue}-${sparkId}-${index}`}
                        sparkId={sparkId}
                     />
                  )
               )}
            </Stack>
         )}
      </GroupSparkAnalyticsCardContainer>
   )
}
