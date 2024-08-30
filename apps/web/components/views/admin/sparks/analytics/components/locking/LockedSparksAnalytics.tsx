import { Stack } from "@mui/material"
import { useMemo } from "react"
import { numberToString } from "util/CommonUtil"
import CFLineChart from "../charts/CFLineChart"
import ChartSwitchButton from "../charts/ChartSwitchButton"
import ChartSwitchButtonGroupContainer from "../ChartSwitchButtonGroupContainer"
import { GroupSparkAnalyticsCardContainer } from "../GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../GroupSparkAnalyticsCardTitle"
import { SectionsWrapper } from "../SectionsWrapper"
import { TitleWithSelect } from "../TitleWithSelect"
import { MockedData } from "./locked-mocked-data"
import { LockedComponentsModal } from "./LockedComponentsModal"
import { LockedContent } from "./LockedContent"
import { MockedStaticSparkCard } from "./MockedStaticSparkCard"

const metrics = ["Reach", "Engagement", "Audience"]

export const LockedSparksAnalytics = () => {
   const mappedXAxisViews = useMemo(
      () => MockedData.overview.totalViews.xAxis.map((item) => new Date(item)),
      []
   )

   const mappedXAxisLikes = useMemo(
      () =>
         MockedData.overview.engagament.likes.xAxis.map(
            (item) => new Date(item)
         ),
      []
   )

   return (
      <>
         <LockedComponentsModal
            title="Unlock enhanced analytics"
            text="Unlock in-depth analytics by upgrading your free trial to the full Sparks feature. You will have access to:"
            metrics={metrics}
         />
         <LockedContent>
            <SectionsWrapper>
               <GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainerTitle>
                     Reach over the past 30 days
                  </GroupSparkAnalyticsCardContainerTitle>
                  <ChartSwitchButtonGroupContainer>
                     <ChartSwitchButton
                        label={"Total views"}
                        value={numberToString(
                           MockedData.overview.totalViews.totalCount
                        )}
                        active={true}
                        onClick={() => null}
                     />
                     <ChartSwitchButton
                        label={"Unique viewers"}
                        value={numberToString(
                           MockedData.overview.totalUniqueViewersCount
                        )}
                        active={false}
                        onClick={() => null}
                     />
                  </ChartSwitchButtonGroupContainer>
                  <GroupSparkAnalyticsCardContainerTitle>
                     {`${numberToString(
                        MockedData.overview.totalViews.totalCount
                     )} views over the 30 days`}
                  </GroupSparkAnalyticsCardContainerTitle>
                  <CFLineChart
                     tooltipLabel={"Views"}
                     xAxis={mappedXAxisViews}
                     series={MockedData.overview.totalViews.series}
                  />
               </GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainerTitle>
                     Engagement over the past 30 days
                  </GroupSparkAnalyticsCardContainerTitle>
                  <ChartSwitchButtonGroupContainer>
                     <ChartSwitchButton
                        label={"Likes"}
                        value={numberToString(
                           MockedData.overview.engagament.likes.totalCount
                        )}
                        active={true}
                        onClick={() => null}
                     />
                     <ChartSwitchButton
                        label={"Shares"}
                        value={numberToString(
                           MockedData.overview.engagament.sharesCount
                        )}
                        active={false}
                        onClick={() => null}
                     />
                     <ChartSwitchButton
                        label={"Registrations"}
                        value={numberToString(
                           MockedData.overview.engagament.registrationsCount
                        )}
                        active={false}
                        onClick={() => null}
                     />
                     <ChartSwitchButton
                        label={"Page clicks"}
                        value={numberToString(
                           MockedData.overview.engagament.pageClicksCount
                        )}
                        active={false}
                        onClick={() => null}
                     />
                  </ChartSwitchButtonGroupContainer>
                  <CFLineChart
                     tooltipLabel={"Likes"}
                     xAxis={mappedXAxisLikes}
                     series={MockedData.overview.engagament.likes.series}
                  />
               </GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainer>
                  <TitleWithSelect
                     title="Your most watched Sparks"
                     selectedOption={"watched"}
                     setSelectedOption={() => null}
                     options={[
                        { value: "watched", label: "Most watched Sparks" },
                     ]}
                  />
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                     {MockedData.overview.mostWatched.map((spark, index) => (
                        <MockedStaticSparkCard
                           key={`most-watched-${spark.spark.sparkId}-${index}`}
                           spark={spark.spark}
                           stats={spark.stats}
                        />
                     ))}
                  </Stack>
               </GroupSparkAnalyticsCardContainer>
            </SectionsWrapper>
         </LockedContent>
      </>
   )
}
