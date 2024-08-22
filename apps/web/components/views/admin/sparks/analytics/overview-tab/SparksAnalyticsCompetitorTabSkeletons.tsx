import { Skeleton, Stack } from "@mui/material"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
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
})

const ContainerTitleSkeleton = () => {
   return <Skeleton variant="text" animation="wave" sx={styles.title} />
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

const BaseContainerSkeleton = ({ children }: BaseContainerSkeletonProps) => {
   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle>
            <ContainerTitleSkeleton />
         </GroupSparkAnalyticsCardContainerTitle>
         {children}
      </GroupSparkAnalyticsCardContainer>
   )
}

export const CompetitorSkeleton = () => {
   return (
      <BaseContainerSkeleton>
         <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <SparkStaticCardSkeleton />
            <SparkStaticCardSkeleton />
            <SparkStaticCardSkeleton />
            <SparkStaticCardSkeleton />
         </Stack>
      </BaseContainerSkeleton>
   )
}
