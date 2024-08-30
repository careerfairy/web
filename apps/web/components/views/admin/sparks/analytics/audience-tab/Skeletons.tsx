import { Skeleton, Stack } from "@mui/material"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"

const BULLET_CHART_ITEM_HEIGHT = 25

export const TopBulletChartsSkeleton = () => {
   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle>
            <Skeleton variant="rectangular" height={30} />
         </GroupSparkAnalyticsCardContainerTitle>
         <Stack spacing={1.5}>
            {[...Array(10)].map((_, index) => (
               <Skeleton
                  key={index}
                  variant="rounded"
                  height={BULLET_CHART_ITEM_HEIGHT}
               />
            ))}
         </Stack>
      </GroupSparkAnalyticsCardContainer>
   )
}

export const PieChartsSkeleton = () => {
   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle>
            <Skeleton variant="rectangular" height={30} />
         </GroupSparkAnalyticsCardContainerTitle>
         <Stack marginTop={6} marginBottom={7} alignItems="center">
            <Skeleton variant="circular" height={300} width={300} />
         </Stack>
         <Stack spacing={1.5}>
            {[...Array(10)].map((_, index) => (
               <Skeleton
                  key={index}
                  variant="rounded"
                  height={BULLET_CHART_ITEM_HEIGHT}
               />
            ))}
         </Stack>
      </GroupSparkAnalyticsCardContainer>
   )
}
