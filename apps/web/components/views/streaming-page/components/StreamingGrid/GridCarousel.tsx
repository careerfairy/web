import { useState, useEffect, useCallback, useMemo, ReactNode } from "react"
import useEmblaCarousel, {
   EmblaCarouselType,
   EmblaOptionsType,
} from "embla-carousel-react"
import { combineStyles, sxStyles } from "types/commonTypes"
import {
   Box,
   ButtonBase,
   ButtonBaseProps,
   Collapse,
   Fade,
   Stack,
} from "@mui/material"

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
      // transform: "translateY(100%)", // Move the container down by its own height
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
      width: 60,
      height: "100%",
      color: "neutral.700",
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
      left: 0,
      backgroundImage: {
         xs: "linear-gradient(270deg, rgba(247, 248, 252, 0.00) 38.02%, rgba(247, 248, 252, 0.80) 92.71%)",
         tablet:
            "linear-gradient(270deg, rgba(247, 248, 252, 0.00) 15.5%, #F7F7F7 100%)",
      },
   },
   nextButton: {
      right: 0,
      backgroundImage: {
         xs: "linear-gradient(90deg, rgba(247, 248, 252, 0.00) 38.02%, rgba(247, 248, 252, 0.80) 92.71%)",
         tablet:
            "linear-gradient(90deg, rgba(247, 248, 252, 0.00) 15.5%, #F7F7F7 100%)",
      },
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
   const [emblaRef, emblaApi] = useEmblaCarousel(options)
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

   const isArrows = navigationMode === "arrows"
   const isDots = navigationMode === "dots"

   return (
      <Box
         id="grid-carousel"
         sx={[
            styles.root,
            showNav && isDots && styles.rootWithDots,
            showNav && floatingDots && isDots && styles.rootWithFloatingDots,
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
         {Boolean(isArrows) && (
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

         {Boolean(isDots) && (
            <Collapse
               id="dots"
               sx={styles.collapseContainer}
               in={gridPages.length > 1}
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
         )}
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
         <ButtonBase
            onClick={onClick}
            disabled={!enabled}
            sx={[styles.arrowButton, styles.prevButton]}
         >
            <ChevronLeft />
         </ButtonBase>
      </Fade>
   )
}

const NextButton = ({ enabled, onClick }: ArrowButtonProps) => {
   return (
      <Fade in={enabled} unmountOnExit>
         <ButtonBase
            onClick={onClick}
            disabled={!enabled}
            sx={[styles.arrowButton, styles.nextButton]}
         >
            <ChevronRight />
         </ButtonBase>
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
