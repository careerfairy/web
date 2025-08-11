import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { Box, IconButton, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChildRefType } from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import { type EmblaOptionsType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React, {
   FC,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { ChevronLeft, ChevronRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import TagsCarousel from "./TagsCarousel"
import { TagsCarouselSkeleton } from "./TagsCarouselSkeleton"

const styles = sxStyles({
   contentWrapper: {
      mx: "16px !important",
      display: "flex",
      flexDirection: "row",
      width: "-webkit-fill-available",
      position: "relative",
      alignItems: "center",
   },

   leftArrowWrapper: {
      position: "absolute",
      left: 0,
      width: "89px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "start",
      background:
         "linear-gradient(90deg, #EEF6F9 33%, rgba(247, 248, 252, 0.00) 100%)",
      pointerEvents: "none",
   },
   rightArrowWrapper: {
      position: "absolute",
      right: 0,
      width: "89px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "end",
      background:
         "linear-gradient(270deg, #EEF6F9 33%, rgba(247, 248, 252, 0.00) 100%)",
      pointerEvents: "none",
   },
   arrowIcon: {
      p: 0,
      flexShrink: 0,
      width: "24px",
      height: "24px",
      backgroundColor: "transparent",
      pointerEvents: "auto",
      "& svg": {
         width: "24px",
         height: "24px",
      },
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

   const handleButtons = useCallback(() => {
      setShowNextButton(emblaApi.canScrollNext())
      setShowPreviousButton(emblaApi.canScrollPrev())
   }, [emblaApi])

   const onClickPrev = () => {
      childRef?.current?.goPrev()
      handleButtons()
   }
   const onClickNext = () => {
      childRef?.current?.goNext()
      handleButtons()
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
      emblaApi?.on("settle", handleButtons)
      emblaApi?.on("init", handleButtons)
      emblaApi?.on("slidesChanged", handleButtons)
      // Cleanup the event listener on component unmount
      return () => {
         emblaApi?.off("settle", handleButtons)
         emblaApi?.off("slidesChanged", handleButtons)
         emblaApi?.off("init", handleButtons)
      }
   }, [emblaApi, handleButtons])

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
            <TagsCarousel
               ref={childRef}
               tags={tags}
               selectedCategories={selectedCategories}
               onTagClick={handleTagClicked}
               onAllClick={handleAllClicked}
               emblaRef={emblaRef}
            />

            {Boolean(showPrevious) && (
               <Box sx={styles.leftArrowWrapper}>
                  <IconButton
                     sx={[
                        styles.arrowIcon,
                        !showPreviousButton ? styles.disabledArrow : null,
                     ]}
                     onClick={onClickPrev}
                  >
                     <Box component={ChevronLeft} />
                  </IconButton>
               </Box>
            )}

            {Boolean(showNext) && (
               <Box sx={styles.rightArrowWrapper}>
                  <IconButton
                     sx={[
                        styles.arrowIcon,
                        !showNextButton ? styles.disabledArrow : null,
                     ]}
                     onClick={onClickNext}
                  >
                     <Box component={ChevronRight} />
                  </IconButton>
               </Box>
            )}
         </Box>
      </Stack>
   )
}

export default TagsCarouselWithArrow
