import { FC } from "react"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"
import { SxProps } from "@mui/material"

type Props = {
   sx?: SxProps
}

const SparkSkeletonComponent: FC<Props> = ({ sx }) => {
   return (
      <SparkAspectRatioBox sx={sx}>
         <SparkCarouselCardSkeleton />
      </SparkAspectRatioBox>
   )
}

export default SparkSkeletonComponent
