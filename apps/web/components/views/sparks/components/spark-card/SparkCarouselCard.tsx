import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import VideoPreview from "./VideoPreview"

const styles = sxStyles({
   root: {
      display: "flex",
      height: {
         xs: 405,
         md: 443,
      },
      width: "100%",
      objectFit: "cover",
      borderRadius: 3,
      overflow: "hidden",
      position: "relative",
      p: 2,

      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
         background: `linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0) 17.71%), linear-gradient(180deg, rgba(0, 0, 0, 0) 82.29%, rgba(0, 0, 0, 0.60) 100%)`,
         zIndex: -1,
      },
   },
})

type Props = {
   spark: Spark
}

const SparkCarouselCard: FC<Props> = ({ spark }) => {
   return (
      <Box sx={styles.root}>
         <VideoPreview videoUrl={spark.videoUrl} />
      </Box>
   )
}

export default SparkCarouselCard
