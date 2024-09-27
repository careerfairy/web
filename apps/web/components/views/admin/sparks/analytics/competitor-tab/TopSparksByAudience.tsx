import {
   CompetitorAudienceSegments,
   CompetitorSparkData,
} from "@careerfairy/shared-lib/sparks/analytics"
import { Stack } from "@mui/material"
import { useState } from "react"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { SparksCarousel } from "../components/SparksCarousel"
import { TitleWithSelect } from "../components/TitleWithSelect"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { CompetitorSparkStaticCard } from "./CompetitorSparkStaticCard"
import { EmptySparksList } from "./EmptySparksList"

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
      selectTimeFilter,
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
         <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            {topSparksByAudience[selectAudienceValue] &&
            topSparksByAudience[selectAudienceValue].length > 0 ? (
               <SparksCarousel>
                  {topSparksByAudience[selectAudienceValue].map(
                     (data: CompetitorSparkData, index) => (
                        <CompetitorSparkStaticCard
                           key={`top-sparks-by-audience-${selectAudienceValue}-${index}`}
                           sparkData={data.sparkData}
                           plays={data.plays}
                           avg_watched_time={data.avg_watched_time}
                           avg_watched_percentage={data.avg_watched_percentage}
                           engagement={data.engagement}
                        />
                     )
                  )}
               </SparksCarousel>
            ) : (
               <EmptySparksList
                  targetLabel="audience"
                  timePeriod={selectTimeFilter}
               />
            )}
         </Stack>
      </GroupSparkAnalyticsCardContainer>
   )
}
