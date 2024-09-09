import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CompanyIndustryValues } from "@careerfairy/shared-lib/constants/forms"
import { Stack } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useMemo, useState } from "react"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { TitleWithSelect } from "../components/TitleWithSelect"
import EmptyDataCheckerForMostSomething from "../overview-tab/EmptyDataCheckers"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { StaticSparkCard } from "./StaticSparkCard"

const ENOUGH_CONTENT_THRESHOLD = 3

const ALL_INDUSTRIES_OPTION: OptionGroup = {
   id: "all",
   name: "All Industries",
}

export const TopSparksByIndustry = () => {
   const { group } = useGroup()
   const {
      filteredAnalytics: { topSparksByIndustry },
   } = useSparksAnalytics()

   const [selectIndustryValue, setSelectIndustryValue] = useState<string>("all")

   const industriesOptions = useMemo(() => {
      const industriesWithEnoughContent = Object.keys(
         topSparksByIndustry
      ).filter(
         (industry) =>
            topSparksByIndustry[industry].length >= ENOUGH_CONTENT_THRESHOLD
      )

      const groupIndustriesById = group.companyIndustries.map(
         (industry) => industry.id
      )

      const allOptions = [ALL_INDUSTRIES_OPTION, ...CompanyIndustryValues].map(
         (industry) => ({
            value: industry.id,
            label: industry.name,
         })
      )

      const result = allOptions.filter(
         (option) =>
            groupIndustriesById.includes(option.value) ||
            industriesWithEnoughContent.includes(option.value)
      )

      return result
   }, [group?.companyIndustries, topSparksByIndustry])

   return (
      <GroupSparkAnalyticsCardContainer>
         <TitleWithSelect
            title="Top Sparks by industry:&nbsp;"
            selectedOption={selectIndustryValue}
            setSelectedOption={setSelectIndustryValue}
            options={industriesOptions}
         />
         {topSparksByIndustry[selectIndustryValue]?.length === 0 ? (
            <EmptyDataCheckerForMostSomething />
         ) : (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
               {topSparksByIndustry[selectIndustryValue].map((data, index) => {
                  return (
                     <StaticSparkCard
                        key={`top-sparks-by-industry-${selectIndustryValue}-${data.sparkId}-${index}`}
                        sparkId={data.sparkId}
                        plays={data.plays}
                        avgWatchedTime={data.avgWatchedTime}
                        engagement={data.engagement}
                     />
                  )
               })}
            </Stack>
         )}
      </GroupSparkAnalyticsCardContainer>
   )
}
