import { FC, ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import { Skeleton, Stack } from "@mui/material"
import ChartSwitchButtonGroupContainer from "../components/ChartSwitchButtonGroupContainer"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"

const styles = sxStyles({
   title: {
      height: "calc(3rem)",
      width: {
         xs: "100%",
         md: "30%",
      },
   },
   button: {
      height: "48px",
      width: "200px",
   },
   chart: {
      marginTop: 3.5,
      height: "273px",
   },
   chartSwipeIndicatorsContainer: {
      marginTop: 2,
      justifyContent: "center",
      display: {
         xs: "flex",
         md: "none",
      },
   },
   chartSwipeIndicator: {
      height: "10px",
      width: "10px",
   },
   sparkStaticCard: {
      width: {
         xs: "100%",
         md: 281,
      },
      height: {
         xs: "154vw",
         md: "523px",
      },
   },
   buttonGroupContainer: {
      display: {
         xs: "none",
         md: "flex",
      },
   },
})

const ContainerTitleSkeleton = () => {
   return <Skeleton variant="text" animation="wave" sx={styles.title} />
}

const ChartSwitchButtonSkeleton = () => {
   return <Skeleton variant="rounded" animation="wave" sx={styles.button} />
}

type ChartSkeletonProps = {
   numOfBullets: number
}

const ChartSkeleton: FC<ChartSkeletonProps> = ({ numOfBullets }) => {
   return (
      <>
         <Skeleton variant="rectangular" animation="wave" sx={styles.chart} />
         <Stack
            direction="row"
            spacing={0.5}
            sx={styles.chartSwipeIndicatorsContainer}
         >
            {Array.from({ length: numOfBullets }, (_, index) => (
               <Skeleton
                  key={`chart-mobile-bullet-${index}`}
                  variant="circular"
                  animation="wave"
                  sx={styles.chartSwipeIndicator}
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
         sx={styles.sparkStaticCard}
      />
   )
}

type BaseContainerSkeletonProps = {
   children: ReactNode
}

const BaseContainerSkeleton: FC<BaseContainerSkeletonProps> = ({
   children,
}) => {
   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle>
            <ContainerTitleSkeleton />
         </GroupSparkAnalyticsCardContainerTitle>
         {children}
      </GroupSparkAnalyticsCardContainer>
   )
}

type BaseChartContainerSkeletonProps = {
   numOfButtons: number
}

const BaseChartContainerSkeleton: FC<BaseChartContainerSkeletonProps> = ({
   numOfButtons,
}) => {
   return (
      <BaseContainerSkeleton>
         <ChartSwitchButtonGroupContainer sx={styles.buttonGroupContainer}>
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
