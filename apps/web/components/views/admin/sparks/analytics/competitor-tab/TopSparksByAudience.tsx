import { CompetitorAudienceSegments } from "@careerfairy/shared-lib/sparks/analytics"
import { Stack } from "@mui/material"
import { useState } from "react"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { TitleWithSelect } from "../components/TitleWithSelect"
import EmptyDataCheckerForMostSomething from "../overview-tab/EmptyDataCheckers"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { StaticSparkCard } from "./StaticSparkCard"

type AudienceOption = {
   value: CompetitorAudienceSegments | "all"
   label: string
}

const AUDIENCE_OPTIOMS: AudienceOption[] = [
   {
      value: "all",
      label: "All Audiences",
   },
   {
      value: "business-plus",
      label: "Business+",
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

export const TopSparksByAudience = () => {
   const {
      filteredAnalytics: { topSparksByAudience },
   } = useSparksAnalytics()

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
               {topSparksByAudience[selectAudienceValue].map((data, index) => (
                  <StaticSparkCard
                     key={`top-sparks-by-audience-${selectAudienceValue}-${data.sparkId}-${index}`}
                     sparkId={data.sparkId}
                     plays={data.plays}
                     avgWatchedTime={data.avgWatchedTime}
                     engagement={data.engagement}
                  />
               ))}
            </Stack>
         )}
      </GroupSparkAnalyticsCardContainer>
   )
}
