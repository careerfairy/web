import { Skeleton, Stack } from "@mui/material"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import ChartSwitchButtonGroupContainer from "../components/ChartSwitchButtonGroupContainer"

const ContainerTitleSkeleton = () => {
   return (
      <Skeleton
         variant="text"
         animation="wave"
         sx={{
            height: "calc(3rem)",
            width: {
               xs: "100%",
               md: "30%",
            },
         }}
      />
   )
}

const ChartSwitchButtonSkeleton = () => {
   return (
      <Skeleton
         variant="rounded"
         animation="wave"
         sx={{
            height: "48px",
            width: "200px",
         }}
      />
   )
}

const ChartSkeleton = ({ numOfBullets }) => {
   return (
      <>
         <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
               marginTop: 3.5,
               height: "273px",
            }}
         />
         <Stack
            direction="row"
            marginTop={2}
            spacing={0.5}
            justifyContent="center"
            sx={{
               display: {
                  xs: "flex",
                  md: "none",
               },
            }}
         >
            {Array.from({ length: numOfBullets }, (_, index) => (
               <Skeleton
                  key={`chart-mobile-bullet-${index}`}
                  variant="circular"
                  animation="wave"
                  sx={{
                     height: "10px",
                     width: "10px",
                  }}
               />
            ))}
         </Stack>
      </>
   )
}

const SparkStaticCardSkeleton = () => {
   return (
      <Skeleton
         variant="rounded"
         animation="wave"
         sx={{
            width: {
               xs: "100%",
               md: 281,
            },
            height: {
               xs: "154vw",
               md: "523px",
            },
         }}
      />
   )
}

const BaseContainerSkeleton = ({ children }) => {
   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle>
            <ContainerTitleSkeleton />
         </GroupSparkAnalyticsCardContainerTitle>
         {children}
      </GroupSparkAnalyticsCardContainer>
   )
}

const BaseChartContainerSkeleton = ({ numOfButtons }) => {
   return (
      <BaseContainerSkeleton>
         <ChartSwitchButtonGroupContainer
            sx={{
               display: {
                  xs: "none",
                  md: "flex",
               },
            }}
         >
            {Array.from({ length: numOfButtons }, (_, index) => (
               <ChartSwitchButtonSkeleton
                  key={`chart-switch-button-skeleton-${index}`}
               />
            ))}
         </ChartSwitchButtonGroupContainer>
         <ChartSkeleton numOfBullets={numOfButtons} />
      </BaseContainerSkeleton>
   )
}

const ReachAnalyticsSkeleton = () => {
   return <BaseChartContainerSkeleton numOfButtons={2} />
}

const EngagementAnalyticsSkeleton = () => {
   return <BaseChartContainerSkeleton numOfButtons={4} />
}

const MostSomethingSkeleton = () => {
   return (
      <BaseContainerSkeleton>
         <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <SparkStaticCardSkeleton />
            <SparkStaticCardSkeleton />
            <SparkStaticCardSkeleton />
         </Stack>
      </BaseContainerSkeleton>
   )
}

export {
   ReachAnalyticsSkeleton,
   EngagementAnalyticsSkeleton,
   MostSomethingSkeleton,
}
