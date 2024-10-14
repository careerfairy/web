import { Box, Skeleton, Stack } from "@mui/material"
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
   tableHeader: {
      height: "25px",
      width: "25%",
   },
   tableRow: {
      height: "46px",
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

export const CompetitorSparksCarouselSkeleton = () => {
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

export const CompetitorTableSkeleton = () => {
   return (
      <BaseContainerSkeleton>
         <Stack
            direction="row"
            spacing={1.5}
            marginLeft="50px"
            marginRight="50px"
            marginBottom={1}
         >
            <Skeleton
               variant="rounded"
               animation="wave"
               sx={[styles.tableHeader, { width: "30%" }]}
            />
            <Box width="10%" />
            <Skeleton
               variant="rounded"
               animation="wave"
               sx={styles.tableHeader}
            />
            <Skeleton
               variant="rounded"
               animation="wave"
               sx={styles.tableHeader}
            />
            <Skeleton
               variant="rounded"
               animation="wave"
               sx={styles.tableHeader}
            />
            <Skeleton
               variant="rounded"
               animation="wave"
               sx={styles.tableHeader}
            />
            <Skeleton
               variant="rounded"
               animation="wave"
               sx={styles.tableHeader}
            />
         </Stack>
         <Stack spacing={2}>
            <Skeleton variant="rounded" animation="wave" sx={styles.tableRow} />
            <Skeleton variant="rounded" animation="wave" sx={styles.tableRow} />
            <Skeleton variant="rounded" animation="wave" sx={styles.tableRow} />
            <Skeleton variant="rounded" animation="wave" sx={styles.tableRow} />
            <Skeleton variant="rounded" animation="wave" sx={styles.tableRow} />
            <Skeleton variant="rounded" animation="wave" sx={styles.tableRow} />
         </Stack>
      </BaseContainerSkeleton>
   )
}
