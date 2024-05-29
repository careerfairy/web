import { Skeleton, SkeletonProps } from "@mui/material"
import { combineStyles } from "types/commonTypes"

const StaticSkeleton = (props: SkeletonProps) => {
   return (
      <Skeleton
         {...props}
         sx={combineStyles({ animation: "none !important" }, props.sx)}
      />
   )
}

export default StaticSkeleton
