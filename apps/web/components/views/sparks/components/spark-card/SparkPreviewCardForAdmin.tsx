import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Stack } from "@mui/material"
import Box from "@mui/material/Box"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import HiddenStatus from "./HiddenStatus"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkHeader from "./SparkHeader"
import SparkPreviewCardContainer, {
   SparkPreviewCardType,
} from "./SparkPreviewCardContainer"
import SparkQuestion from "./SparkQuestion"
import SparkStats from "./SparkStats"

const cardPadding = 1.5

const styles = sxStyles({
   cardDetails: {
      cursor: "pointer",
   },
})

type Props = {
   spark: Spark
   type?: SparkPreviewCardType
   preview?: boolean
   onClick?: () => void
}

const SparkPreviewCardForAdmin: FC<Props> = ({
   spark,
   onClick,
   type = "carousel",
   preview = true,
}) => {
   return (
      <SparkPreviewCardContainer
         componentHeader={<HiddenStatus sparkPublished={spark.published} />}
         type={type}
         video={{
            thumbnailUrl: getResizedUrl(spark.video.thumbnailUrl, "lg"),
            url: spark.video.url,
            preview: !preview,
            muted: false,
         }}
         autoPlaying={type === "fullScreen"}
      >
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
      </SparkPreviewCardContainer>
   )
}

export default SparkPreviewCardForAdmin
