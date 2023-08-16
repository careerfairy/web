import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import HiddenStatus from "./HiddenStatus"
import SparkHeader from "./SparkHeader"
import VideoPreview from "./VideoPreview"
import SparkStats from "./SparkStats"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkQuestion from "./SparkQuestion"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import { Stack } from "@mui/material"
import SparkCarouselCardContainer from "./SparkCarouselCardContainer"

const cardPadding = 2

const styles = sxStyles({
   root: {
      color: "white",
      display: "flex",
      height: "100%",
      width: "100%",
      objectFit: "cover",
      borderRadius: 3,
      position: "relative",
      flexDirection: "column",
      overflow: "hidden",
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
   cardDetails: {
      cursor: "pointer",
   },
})

type Props = {
   spark: Spark
   preview?: boolean
   onClick?: () => void
}

const SparkCarouselCardForAdmin: FC<Props> = ({
   spark,
   onClick,
   preview = true,
}) => {
   return (
      <SparkCarouselCardContainer
         componentHeader={<HiddenStatus sparkPublished={spark.published} />}
         video={{
            thumbnailUrl: getResizedUrl(spark.video.thumbnailUrl, "lg"),
            url: spark.video.url,
            preview: !preview,
         }}
      >
         <Box sx={styles.cardContent}>
            <Box px={cardPadding} pt={cardPadding}>
               <SparkHeader showAdminOptions={preview} spark={spark} />
            </Box>
            <Stack
               sx={styles.cardDetails}
               p={cardPadding}
               onClick={onClick}
               flexGrow={1}
            >
               <Box mt="auto" />
               <SparkStats spark={spark} />
               <Box mt={1.5} />
               <SparkCategoryChip categoryId={spark.category.id} />
               <Box mt={1.5} />
               <SparkQuestion limitLines={preview} question={spark.question} />
            </Stack>
         </Box>
      </SparkCarouselCardContainer>
   )
}

export default SparkCarouselCardForAdmin
