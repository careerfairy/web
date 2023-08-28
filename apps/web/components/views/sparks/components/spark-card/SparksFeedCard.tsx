import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Stack } from "@mui/material"
import Box from "@mui/material/Box"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import FeedCardActions from "pages/sparks-feed/FeedCardActions"
import useSparksFeedIsFullScreen from "pages/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkDetails from "./SparkDetails"
import SparkQuestion from "./SparkQuestion"
import VideoPreview from "./VideoPreview"

const styles = sxStyles({
   root: {
      borderRadius: 3.25,
      width: "100%",
      height: "100%",
      color: "white",
      display: "flex",
      objectFit: "cover",
      position: "relative",
      flexDirection: "column",
      overflow: "hidden",
   },
   fullScreenRoot: {
      borderRadius: 0,
   },
   cardContent: {
      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
         // Provides a gradient overlay at the top and bottom of the card to make the text more readable.
         background: `linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0) 17.71%), linear-gradient(180deg, rgba(0, 0, 0, 0) 82.29%, rgba(0, 0, 0, 0.60) 100%)`,
         zIndex: -1,
      },
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      flex: 1,
      position: "relative",
   },
   contentInner: {
      display: "flex",
      mt: "auto",
      p: 2.5,
      px: 1.5,
   },
   cardDetails: {
      cursor: "pointer",
   },
   outerActionsWrapper: {
      position: "absolute",
      bottom: "0",
      right: "0",
      transform: "translate(100%, 0)",
      pl: 2.9375,
      pb: 4,
   },
})

type Props = {
   spark: SparkPresenter
   playing: boolean
}

const SparksFeedCard: FC<Props> = ({ spark, playing }) => {
   const isFullScreen = useSparksFeedIsFullScreen()

   return (
      <>
         <Box sx={[styles.root, isFullScreen && styles.fullScreenRoot]}>
            <VideoPreview
               thumbnailUrl={getResizedUrl(spark.video.thumbnailUrl, "lg")}
               videoUrl={spark.video.url}
               playing={playing}
               containThumbnail={isFullScreen}
            />
            <Box sx={styles.cardContent}>
               <Box sx={styles.contentInner}>
                  <Stack sx={styles.cardDetails} flexGrow={1}>
                     <Box mt="auto" />
                     <SparkDetails
                        companyLogoUrl={getResizedUrl(
                           spark.group.logoUrl,
                           "md"
                        )}
                        displayName={`${spark.creator.firstName} ${spark.creator.lastName}`}
                        companyName={spark.group.universityName}
                     />
                     <Box mt={2.5} />
                     <SparkCategoryChip categoryId={spark.category.id} />
                     <Box mt={1.5} />
                     <SparkQuestion question={spark.question} />
                  </Stack>
                  {isFullScreen ? <FeedCardActions spark={spark} /> : null}
               </Box>
            </Box>
         </Box>
         {isFullScreen ? null : (
            <Box sx={styles.outerActionsWrapper}>
               <FeedCardActions spark={spark} />
            </Box>
         )}
      </>
   )
}

export default SparksFeedCard
