import { FC, useState } from "react"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import { sxStyles } from "types/commonTypes"
import SparkHeader from "./SparkHeader"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkQuestion from "./SparkQuestion"
import { Stack } from "@mui/material"
import SparkCarouselCardContainer from "./SparkCarouselCardContainer"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"

const cardPadding = 2

const styles = sxStyles({
   cardDetails: {
      cursor: "pointer",
      justifyContent: "flex-end",
      gap: "6px",
   },
})

type Props = {
   spark: Spark
   preview?: boolean
   onClick?: () => void
}

const SparkCarouselCard: FC<Props> = ({ spark, onClick, preview = false }) => {
   const sparkPresenter = SparkPresenter.createFromFirebaseObject(spark)
   const [isHovered, setIsHovered] = useState(false)

   return (
      <SparkCarouselCardContainer
         video={{
            thumbnailUrl: spark.video.thumbnailUrl,
            url: sparkPresenter.getTransformedVideoUrl(),
            preview: preview,
         }}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         isHovered={isHovered}
      >
         <Box px={cardPadding} pt={cardPadding}>
            <SparkHeader showAdminOptions={false} spark={spark} />
         </Box>
         <Stack
            sx={styles.cardDetails}
            p={cardPadding}
            onClick={onClick}
            flexGrow={1}
         >
            <SparkCategoryChip categoryId={spark.category.id} />
            <SparkQuestion question={spark.question}></SparkQuestion>
         </Stack>
      </SparkCarouselCardContainer>
   )
}

export default SparkCarouselCard
