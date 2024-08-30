import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CompanyIndustryValues } from "@careerfairy/shared-lib/constants/forms"
import {
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

const ALL_INDUSTRIES_OPTION: OptionGroup = {
   id: "AllIndustries",
   name: "All Industries",
}

const INDUSTIRES_OPTIONS = [
   ALL_INDUSTRIES_OPTION,
   ...CompanyIndustryValues,
].map((industry) => ({
   value: industry.id,
   label: industry.name,
}))

type TopSparksByIndustryContainerProps = {
   timeFilter: TimePeriodParams
}

export const TopSparksByIndustry = ({
   timeFilter,
}: TopSparksByIndustryContainerProps) => {
   const { group } = useGroup()
   const {
      topSparksByIndustry,
   }: SparkAnalyticsClientWithPastData[TimePeriodParams] = useSparksAnalytics(
      group.id
   )[timeFilter]

   const [selectValue, setSelectValue] = useState<string>("AllIndustries")

   return (
      <GroupSparkAnalyticsCardContainer>
         <TitleWithSelect
            title="Top Sparks by industry:&nbsp;"
            selectedOption={selectValue}
            setSelectedOption={setSelectValue}
            options={INDUSTIRES_OPTIONS}
         />
         {topSparksByIndustry?.length === 0 ? (
            <EmptyDataCheckerForMostSomething />
         ) : (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
               {topSparksByIndustry.map((sparkId, index) => (
                  <StaticSparkCard
                     key={`top-sparks-by-industry-${selectValue}-${sparkId}-${index}`}
                     sparkId={sparkId}
                  />
               ))}
            </Stack>
         )}
      </GroupSparkAnalyticsCardContainer>
   )
}
