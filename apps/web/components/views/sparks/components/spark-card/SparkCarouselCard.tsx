import { FC, useEffect, useRef, useState } from "react"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import { sxStyles } from "types/commonTypes"
import SparkHeader from "./SparkHeader"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkQuestion from "./SparkQuestion"
import { Stack } from "@mui/material"
import SparkCarouselCardContainer from "./SparkCarouselCardContainer"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import useIsMobile from "components/custom-hook/useIsMobile"
import { debounce } from "lodash"

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
   // console.log("🚀 ~ isHovered:", isHovered)
   const containerRef = useRef<HTMLDivElement>(null)
   const isMobile = useIsMobile()

   useEffect(() => {
      const currentContainerRef = containerRef.current

      const observable = (entries) => {
         const entry = entries[0]

         if (entry.isIntersecting && entry.intersectionRatio === 1) {
            // console.log("START -> ", entry)
            setIsHovered(true)
         } else {
            // console.log("STOP -> ", entry)
            setIsHovered(false)
         }
      }

      const debouncedObservable = debounce(observable, 300)

      if (isMobile) {
         const observer = new IntersectionObserver(debouncedObservable, {
            threshold: 1.0,
         })

         if (currentContainerRef) {
            observer.observe(currentContainerRef)
         }

         return () => {
            if (currentContainerRef) {
               observer.unobserve(currentContainerRef)
            }
         }
      }
   }, [isMobile])

   return (
      <SparkCarouselCardContainer
         video={{
            thumbnailUrl: spark.video.thumbnailUrl,
            url: sparkPresenter.getTransformedVideoUrl(),
            preview: preview,
         }}
         onMouseEnter={isMobile ? null : () => setIsHovered(true)}
         onMouseLeave={isMobile ? null : () => setIsHovered(false)}
         isHovered={isHovered}
         containerRef={containerRef}
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
