import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import {
   SPARK_DESKTOP_WIDTH,
   SPARK_MOBILE_WIDTH,
   SparkPreviewCardType,
} from "./SparkPreviewCardContainer"

const styles = sxStyles({
   root: {
      color: "white",
      display: "flex",
      objectFit: "cover",
      borderRadius: 3,
      position: "relative",
      flexDirection: "column",
      overflow: "hidden",
      aspectRatio: "9/16",
      minWidth: SPARK_MOBILE_WIDTH,
   },
   carouselRoot: {
      width: SPARK_DESKTOP_WIDTH,
      minWidth: "unset",
   },
   carouselRootMobile: {
      width: SPARK_MOBILE_WIDTH,
      minWidth: "unset",
   },
   skeleton: {
      height: "100%",
      width: "100%",
   },
})

type SparkCardSkeletonProps = {
   type?: SparkPreviewCardType
}

const SparkCardSkeleton: FC<SparkCardSkeletonProps> = ({
   type = "gallery",
}) => {
   const isMobile = useIsMobile()

   const getRootStyles = () => {
      if (type === "carousel") {
         return isMobile ? styles.carouselRootMobile : styles.carouselRoot
      }
   }

   return (
      <Box sx={[styles.root, getRootStyles()]}>
         <Skeleton variant="rectangular" sx={styles.skeleton} />
      </Box>
   )
}

export default SparkCardSkeleton
