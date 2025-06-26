import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { Box, IconButton, Stack } from "@mui/material"
import { ArrowLeftIcon, ArrowRightIcon } from "@mui/x-date-pickers"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { ChildRefType } from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React, { FC, useEffect, useMemo, useRef, useState } from "react"
import { sxStyles } from "types/commonTypes"
import TagsCarousel from "./TagsCarousel"
import { TagsCarouselSkeleton } from "./TagsCarouselSkeleton"

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
   dragFree: true,
   skipSnaps: true,
   slidesToScroll: 2,
}

type CarouselProps = {
   selectedCategories: string[]
   tags: OptionGroup[]
   handleTagClicked: (tagId: string) => void
   handleAllClicked?: () => void
   isLoading?: boolean
}

const TagsCarouselWithArrow: FC<CarouselProps> = ({
   tags,
   handleTagClicked,
   selectedCategories,
   handleAllClicked,
   isLoading,
}) => {
   const isMobile = useIsMobile()
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

   const showNext = useMemo(() => {
      return !isMobile && showNextButton
   }, [isMobile, showNextButton])

   const showPrevious = useMemo(() => {
      return !isMobile && showPreviousButton
   }, [isMobile, showPreviousButton])

   useEffect(() => {
      const handleButtons = () => {
         setShowNextButton(emblaApi.canScrollNext())
         setShowPreviousButton(emblaApi.canScrollPrev())
      }

      emblaApi?.on("settle", handleButtons)
      emblaApi?.on("init", handleButtons)
      emblaApi?.on("slidesChanged", handleButtons)
      // Cleanup the event listener on component unmount
      return () => {
         emblaApi?.off("settle", handleButtons)
         emblaApi?.off("slidesChanged", handleButtons)
         emblaApi?.off("init", handleButtons)
      }
   }, [emblaApi])

   React.useImperativeHandle(childRef, () => ({
      goNext() {
         if (!showPreviousButton) {
            emblaApi.scrollNext()
         }
         emblaApi.scrollNext()
      },
      goPrev() {
         emblaApi.scrollPrev()
      },
   }))

   if (isLoading) {
      return <TagsCarouselSkeleton />
   }

   if (!tags?.length) return null

   return (
      <Stack spacing={1.25} direction={"row"} mb={3}>
         <Box sx={styles.contentWrapper}>
            <ConditionalWrapper condition={showPrevious}>
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
            <ConditionalWrapper condition={showNext}>
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
