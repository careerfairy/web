import { FC } from "react"
import { SxProps } from "@mui/material"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"

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
