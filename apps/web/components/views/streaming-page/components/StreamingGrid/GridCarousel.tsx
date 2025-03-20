import {
   Box,
   ButtonBase,
   ButtonBaseProps,
   Collapse,
   Fade,
   IconButton,
   Stack,
} from "@mui/material"
import useEmblaCarousel, {
   EmblaCarouselType,
   EmblaOptionsType,
} from "embla-carousel-react"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { ChevronLeft, ChevronRight } from "react-feather"

const SLIDE_SIZE = "100%"

export const MOBILE_SPACING = 0.75
export const DESKTOP_SPACING = 2

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      transition: (theme) => theme.transitions.create(["margin", "padding"]),
   },
   rootWithDots: {
      pb: 2,
   },
   rootWithFloatingDots: {
      mb: -2,
   },
   viewport: {
      overflow: "hidden",
      flex: 1,
      height: "100%",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
      marginLeft: {
         xs: MOBILE_SPACING * -1,
         tablet: DESKTOP_SPACING * -1,
      },
      height: "100%",
   },
   slide: {
      flex: `0 0 ${SLIDE_SIZE}`,
      minWidth: "0",
      position: "relative",
      paddingLeft: {
         xs: MOBILE_SPACING,
         tablet: DESKTOP_SPACING,
      },
   },
   collapseContainer: {
      position: "absolute", // To ensure the dots don't change component height
      bottom: 0,
      width: "100%",
   },
   dot: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      backgroundColor: "#D9D9D9",
      transition: (theme) => theme.transitions.create("background-color"),
   },
   dotSelected: {
      backgroundColor: "#808080",
   },
   arrowButton: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      color: (theme) => theme.brand.white[50],
      p: 0,
      "& svg": {
         width: {
            xs: 24,
            tablet: 32,
         },
         height: {
            xs: 24,
            tablet: 32,
         },
      },
      transition: (theme) => theme.transitions.create(["background-color"]),
      "&:hover,&:focus": {
         backgroundColor: (theme) => theme.palette.action.hover,
      },
   },
   prevButton: {
      left: -4,
   },
   nextButton: {
      right: -4,
   },
})

type Props = {
   gridPages: ReactNode[]
   navigationMode: "arrows" | "dots"
   floatingDots?: boolean
}

export const GridCarousel = ({
   gridPages,
   navigationMode,
   floatingDots,
}: Props) => {
   const showNav = gridPages.length > 1

   const options = useMemo<EmblaOptionsType>(
      () => ({
         active: showNav,
      }),
      [showNav]
   )
   const [emblaRef, emblaApi] = useEmblaCarousel(options, [
      WheelGesturesPlugin(),
   ])
   const [selectedIndex, setSelectedIndex] = useState(0)
   const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

   const scrollTo = useCallback(
      (index: number) => emblaApi && emblaApi.scrollTo(index),
      [emblaApi]
   )

   const onInit = useCallback((emblaApi: EmblaCarouselType) => {
      setScrollSnaps(emblaApi.scrollSnapList())
   }, [])

   const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
   }, [])

   useEffect(() => {
      if (!emblaApi) return

      onInit(emblaApi)
      onSelect(emblaApi)
      emblaApi.on("reInit", onInit)
      emblaApi.on("reInit", onSelect)
      emblaApi.on("select", onSelect)
   }, [emblaApi, onInit, onSelect])

   const showArrows = navigationMode === "arrows"
   const showDots = navigationMode === "dots"

   return (
      <Box
         id="grid-carousel"
         sx={[
            styles.root,
            showNav && showDots && styles.rootWithDots,
            showNav && floatingDots && showDots && styles.rootWithFloatingDots,
         ]}
      >
         <Box sx={styles.viewport} ref={emblaRef}>
            <Box sx={styles.container}>
               {gridPages.map((node, idx) => (
                  <Box sx={styles.slide} key={idx}>
                     {node}
                  </Box>
               ))}
            </Box>
         </Box>
         {Boolean(showArrows) && (
            <>
               <PrevButton
                  enabled={selectedIndex > 0}
                  onClick={() => scrollTo(selectedIndex - 1)}
               />
               <NextButton
                  enabled={selectedIndex < gridPages.length - 1}
                  onClick={() => scrollTo(selectedIndex + 1)}
               />
            </>
         )}

         <Collapse
            id="dots"
            sx={styles.collapseContainer}
            in={gridPages.length > 1 && showDots}
            unmountOnExit
         >
            <Stack
               direction="row"
               justifyContent="center"
               pt={{
                  xs: 1.25,
                  tablet: 1.5,
               }}
               spacing={0.875}
            >
               {scrollSnaps.map((_, index) => (
                  <DotButton
                     key={index}
                     onClick={() => scrollTo(index)}
                     sx={index === selectedIndex && styles.dotSelected}
                  />
               ))}
            </Stack>
         </Collapse>
      </Box>
   )
}

type ArrowButtonProps = {
   onClick: () => void
   enabled: boolean
}

const PrevButton = ({ enabled, onClick }: ArrowButtonProps) => {
   return (
      <Fade in={enabled} unmountOnExit>
         <IconButton
            onClick={onClick}
            disabled={!enabled}
            sx={[styles.arrowButton, styles.prevButton]}
         >
            <ChevronLeft />
         </IconButton>
      </Fade>
   )
}

const NextButton = ({ enabled, onClick }: ArrowButtonProps) => {
   return (
      <Fade in={enabled} unmountOnExit>
         <IconButton
            onClick={onClick}
            disabled={!enabled}
            sx={[styles.arrowButton, styles.nextButton]}
         >
            <ChevronRight />
         </IconButton>
      </Fade>
   )
}

export const DotButton = (props: ButtonBaseProps) => {
   const { children, sx, ...restProps } = props

   return (
      <ButtonBase
         type="button"
         sx={combineStyles(styles.dot, sx)}
         {...restProps}
      >
         {children}
      </ButtonBase>
   )
}
