import {
   SparkAnalyticsClientWithPastData,
   TimePeriodParams,
} from "@careerfairy/shared-lib/sparks/analytics"
import { Stack } from "@mui/material"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useState } from "react"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import {
   TitleWithSelect,
   TitleWithSelectOption,
} from "../components/TitleWithSelect"
import EmptyDataCheckerForMostSomething from "../overview-tab/EmptyDataCheckers"
import { StaticSparkCard } from "./StaticSparkCard"

const AUDIENCE_OPTIOMS: TitleWithSelectOption[] = [
   {
      value: "Business+",
      label: "Business+",
   },
   {
      value: "Engineering",
      label: "Engineering",
   },
   {
      value: "ITMathematics",
      label: "IT & Mathematics",
   },
   {
      value: "NaturalSciences",
      label: "Natural sciences",
   },
   {
      value: "SocialSciences",
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

   const [selectMostSomethingValue, setSelectMostSomethingValue] =
      useState<string>("Business+")

   return (
      <GroupSparkAnalyticsCardContainer>
         <TitleWithSelect
            title="Top Sparks by audience:&nbsp;"
            selectedOption={selectMostSomethingValue}
            setSelectedOption={setSelectMostSomethingValue}
            options={AUDIENCE_OPTIOMS}
         />
         {topSparksByAudience?.length === 0 ? (
            <EmptyDataCheckerForMostSomething />
         ) : (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
               {topSparksByAudience.map((sparkId, index) => (
                  <StaticSparkCard
                     key={`top-sparks-by-audience-${selectMostSomethingValue}-${sparkId}-${index}`}
                     sparkId={sparkId}
                  />
               ))}
            </Stack>
         )}
      </GroupSparkAnalyticsCardContainer>
   )
}
