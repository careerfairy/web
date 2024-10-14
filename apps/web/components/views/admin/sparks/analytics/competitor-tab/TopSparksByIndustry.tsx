import { Stack } from "@mui/material"
import { useState } from "react"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { SparksCarousel } from "../components/SparksCarousel"
import { TitleWithSelect } from "../components/TitleWithSelect"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { CompetitorSparkStaticCard } from "./CompetitorSparkStaticCard"
import { EmptySparksList } from "./EmptySparksList"

export const TopSparksByIndustry = () => {
   const {
      filteredAnalytics: { topSparksByIndustry },
      selectTimeFilter,
      industriesOptions,
   } = useSparksAnalytics()

   const [selectIndustryValue, setSelectIndustryValue] = useState<string>("all")

   return (
      <GroupSparkAnalyticsCardContainer>
         <TitleWithSelect
            title="Top Sparks by industry:&nbsp;"
            selectedOption={selectIndustryValue}
            setSelectedOption={setSelectIndustryValue}
            options={industriesOptions}
         />
         <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            {topSparksByIndustry[selectIndustryValue] &&
            topSparksByIndustry[selectIndustryValue].length > 0 ? (
               <SparksCarousel>
                  {topSparksByIndustry[selectIndustryValue].map(
                     (data, index) => {
                        return (
                           <CompetitorSparkStaticCard
                              key={`top-sparks-by-industry-${selectIndustryValue}-${index}`}
                              sparkData={data.sparkData}
                              num_views={data.num_views}
                              avg_watched_time={data.avg_watched_time}
                              avg_watched_percentage={
                                 data.avg_watched_percentage
                              }
                              engagement={data.engagement}
                           />
                        )
                     }
                  )}
               </SparksCarousel>
            ) : (
               <EmptySparksList
                  targetLabel="industry"
                  timePeriod={selectTimeFilter}
               />
            )}
         </Stack>
      </GroupSparkAnalyticsCardContainer>
   )
}
