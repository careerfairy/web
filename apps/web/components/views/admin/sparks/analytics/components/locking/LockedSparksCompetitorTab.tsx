import { Box, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { GroupSparkAnalyticsCardContainer } from "../GroupSparkAnalyticsCardContainer"
import { SectionsWrapper } from "../SectionsWrapper"
import { TitleWithSelect } from "../TitleWithSelect"
import { MockedData } from "./locked-mocked-data"
import { LockedComponentsModal } from "./LockedComponentsModal"
import { MockedStaticSparkCard } from "./MockedStaticSparkCard"

const styles = sxStyles({
   analyticsContainer: {
      filter: "brightness(0.97) blur(5px)",
   },
   cardsContainer: {
      flexDirection: {
         xs: "column",
         md: "row",
      },
      gap: 1.5,
   },
})

const metrics = [
   "Benchmark Performance",
   "Uncover Strengths & Weaknesses ",
   "Stay Ahead of Trends",
]

export const LockedSparksCompetitorTab = () => {
   return (
      <>
         <LockedComponentsModal
            title="Unlock competitor analytics"
            text="Upgrade to our premium plan to unlock in-depth competitor analytics and gain insights into how your company stacks up against the competition."
            metrics={metrics}
         />
         <Box sx={styles.analyticsContainer}>
            <SectionsWrapper>
               <GroupSparkAnalyticsCardContainer>
                  <TitleWithSelect
                     title="Top Sparks by industry:&nbsp;"
                     selectedOption={"all"}
                     setSelectedOption={() => null}
                     options={[{ value: "all", label: "All Industries" }]}
                  />
                  <Stack sx={styles.cardsContainer}>
                     {MockedData.industry.map((mockedSpark, index) => (
                        <MockedStaticSparkCard
                           key={`top-sparks-by-industry-all-${mockedSpark.spark.id}-${index}`}
                           spark={mockedSpark.spark}
                           stats={mockedSpark.stats}
                        />
                     ))}
                  </Stack>
               </GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainer>
                  <TitleWithSelect
                     title="Top Sparks by industry:&nbsp;"
                     selectedOption={"all"}
                     setSelectedOption={() => null}
                     options={[{ value: "all", label: "All Industries" }]}
                  />
                  <Stack sx={styles.cardsContainer}>
                     {MockedData.audience.map((mockedSpark, index) => (
                        <MockedStaticSparkCard
                           key={`top-sparks-by-industry-all-${mockedSpark.spark.id}-${index}`}
                           spark={mockedSpark.spark}
                           stats={mockedSpark.stats}
                        />
                     ))}
                  </Stack>
               </GroupSparkAnalyticsCardContainer>
            </SectionsWrapper>
         </Box>
      </>
   )
}
