import { SxProps } from "@mui/material"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import SparkCardSkeleton from "components/views/sparks/components/spark-card/SparkCardSkeleton"
import { FC } from "react"

type Props = {
   sx?: SxProps
}

const SparkSkeletonComponent: FC<Props> = ({ sx }) => {
   return (
      <SparkAspectRatioBox sx={sx}>
         <SparkCardSkeleton />
      </SparkAspectRatioBox>
   )
}

export default SparkSkeletonComponent
