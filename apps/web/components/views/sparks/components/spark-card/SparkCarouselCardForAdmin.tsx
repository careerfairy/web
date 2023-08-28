import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import HiddenStatus from "./HiddenStatus"
import SparkHeader from "./SparkHeader"
import SparkStats from "./SparkStats"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkQuestion from "./SparkQuestion"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import { Stack } from "@mui/material"
import SparkCarouselCardContainer from "./SparkCarouselCardContainer"

const cardPadding = 2

const styles = sxStyles({
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
      </SparkCarouselCardContainer>
   )
}

export default SparkCarouselCardForAdmin
