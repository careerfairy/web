import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { Box, IconButton, Stack } from "@mui/material"
import { ArrowLeftIcon, ArrowRightIcon } from "@mui/x-date-pickers"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { ChildRefType } from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React, { FC, useRef, useState } from "react"
import { sxStyles } from "types/commonTypes"
import TagsCarousel from "./TagsCarousel"

const styles = sxStyles({
   contentWrapper: {
      display: "flex",
      flexDirection: "row",
      width: "-webkit-fill-available",
   },
   arrowWrapper: {
      backgroundColor: "red",
      background:
         "linear-gradient(270deg, #F7F8FC 33%, rgba(247, 248, 252, 0.00) 100%)",
   },
   arrowIcon: {
      p: 0,
      backgroundColor: "black",
   },
   disabledArrow: {
      opacity: 0,
   },
})

const tagsCarouselEmblaOptions: EmblaOptionsType = {
   loop: false,
   dragFree: true,
   skipSnaps: true,
}

type CarouselProps = {
   selectedCategories: string[]
   tags: OptionGroup[]
   handleTagClicked: (tagId: string) => void
   handleAllClicked?: () => void
}

const TagsCarouselWithArrow: FC<CarouselProps> = ({
   tags,
   handleTagClicked,
   selectedCategories,
   handleAllClicked,
}) => {
   const childRef = useRef<ChildRefType | null>(null)

   const [emblaRef, emblaApi] = useEmblaCarousel(tagsCarouselEmblaOptions, [
      WheelGesturesPlugin(),
   ])

   const onClickPrev = () => {
      childRef?.current?.goPrev()
   }
   const onClickNext = () => {
      childRef?.current?.goNext()
   }

   const [showPreviousButton, setShowPreviousButton] = useState(false)
   const [showNextButton, setShowNextButton] = useState(true)

   emblaApi?.on("scroll", () => {
      setShowNextButton(emblaApi.canScrollNext())
      setShowPreviousButton(emblaApi.canScrollPrev())
   })

   React.useImperativeHandle(childRef, () => ({
      goNext() {
         emblaApi.scrollNext()
      },
      goPrev() {
         emblaApi.scrollPrev()
      },
   }))

   if (!tags?.length) return null

   return (
      <Stack spacing={1.25} direction={"row"} ml={2} mb={3}>
         <Box sx={styles.contentWrapper}>
            <ConditionalWrapper condition={showPreviousButton}>
               <Box sx={[styles.arrowWrapper]}>
                  <IconButton
                     sx={[
                        styles.arrowIcon,
                        !showPreviousButton ? styles.disabledArrow : null,
                     ]}
                     onClick={onClickPrev}
                  >
                     <ArrowLeftIcon fontSize={"large"} />
                  </IconButton>
               </Box>
            </ConditionalWrapper>

            <TagsCarousel
               ref={childRef}
               tags={tags}
               selectedCategories={selectedCategories}
               onTagClick={handleTagClicked}
               onAllClick={handleAllClicked}
               emblaRef={emblaRef}
            />
            <ConditionalWrapper condition={showNextButton}>
               <Box sx={[styles.arrowWrapper]}>
                  <IconButton
                     sx={[
                        styles.arrowIcon,
                        !showNextButton ? styles.disabledArrow : null,
                     ]}
                     onClick={onClickNext}
                  >
                     <ArrowRightIcon fontSize={"large"} />
                  </IconButton>
               </Box>
            </ConditionalWrapper>
         </Box>
      </Stack>
   )
}

export default TagsCarouselWithArrow
