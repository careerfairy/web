import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import {
   SPARK_DESKTOP_WIDTH,
   SPARK_MOBILE_WIDTH,
} from "./SparkPreviewCardContainer"

const styles = sxStyles({
   root: {
      display: "flex",
      height: {
         xs: 370,
         md: 410,
      },
      width: "100%",
      overflow: "hidden",
      flexDirection: "column",
      borderRadius: 3,
   },
   skeleton: {
      height: "100%",
      width: SPARK_DESKTOP_WIDTH,
      transition: (theme) => theme.transitions.create("width"),
   },
   skeletonMobile: {
      width: SPARK_MOBILE_WIDTH,
   },
})

const SparkCarouselCardSkeleton: FC = () => {
   const isMobile = useIsMobile()

   return (
      <Box sx={styles.root}>
         <Skeleton
            variant="rectangular"
            sx={[styles.skeleton, isMobile && styles.skeletonMobile]}
         />
      </Box>
   )
}

export default SparkCarouselCardSkeleton
