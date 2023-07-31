import Skeleton from "@mui/material/Skeleton"
import Box from "@mui/material/Box"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      height: {
         xs: 405,
         md: 443,
      },
      width: "100%",
      overflow: "hidden",
      flexDirection: "column",
      borderRadius: 3,
   },
   skeleton: {
      width: "100%",
      height: "100%",
   },
})

const SparkCarouselCardSkeleton: FC = () => {
   return (
      <Box sx={styles.root}>
         <Skeleton variant="rectangular" sx={styles.skeleton} />
      </Box>
   )
}

export default SparkCarouselCardSkeleton
