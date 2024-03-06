import { Box, ButtonBase, Fade } from "@mui/material"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"

import { usePrevNextButtons } from "components/custom-hook/embla-carousel/usePrevNextButtons"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { ChevronLeft, ChevronRight } from "react-feather"
import { UserStream } from "../../types"
import { UserStreamComponent } from "./gallery/UserStreamComponent"

export const MOBILE_SPACING = 0.75
export const DESKTOP_SPACING = 2

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      position: "relative",
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
      // flex: `0 0 ${SLIDE_SIZE}`,
      borderRadius: "10px",
      overflow: "hidden",
      // flex: `0 0 auto`,
      minWidth: "0",
      position: "relative",
      paddingLeft: {
         xs: MOBILE_SPACING,
         tablet: DESKTOP_SPACING,
      },
   },
   btnWrapper: {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      height: "100%",
      p: 1,
      "& svg": {
         color: (theme) => theme.brand.white[50],
         width: {
            xs: 24,
            tablet: 32,
         },
         height: {
            xs: 24,
            tablet: 32,
         },
      },
      borderRadius: "10px",
      overflow: "hidden",
   },
   btn: {
      transition: (theme) => theme.transitions.create(["background-color"]),
      "&:hover,&:focus": {
         backgroundColor: (theme) => theme.palette.action.hover,
      },
      p: 0,
   },
   prevButtonWrapper: {
      left: 0,
      background: "linear-gradient(to right, rgba(0,0,0,0.5), transparent)",
   },
   nextButtonWrapper: {
      right: 0,
      background: "linear-gradient(to left, rgba(0,0,0,0.5), transparent)",
   },
})

type Props = {
   streams: UserStream[]
   maxItemsToShowAtOnce: number
}

export const RowCarousel = ({ streams, maxItemsToShowAtOnce }: Props) => {
   const active = streams.length > maxItemsToShowAtOnce

   const options = useMemo<EmblaOptionsType>(
      () => ({
         active: active,
      }),
      [active]
   )
   const [emblaRef, emblaApi] = useEmblaCarousel(options, [
      WheelGesturesPlugin(),
   ])

   const {
      nextBtnDisabled,
      onNextButtonClick,
      onPrevButtonClick,
      prevBtnDisabled,
   } = usePrevNextButtons(emblaApi)

   return (
      <Box id="grid-carousel" sx={styles.root}>
         <Box sx={styles.viewport} ref={emblaRef}>
            <Box sx={styles.container}>
               {streams.map((stream) => (
                  <Box
                     sx={[
                        styles.slide,
                        {
                           flex: `0 0 ${100 / maxItemsToShowAtOnce}%`,
                        },
                     ]}
                     key={stream.user.uid}
                  >
                     <UserStreamComponent user={stream} />
                  </Box>
               ))}
            </Box>
         </Box>
         <PrevButton enabled={!prevBtnDisabled} onClick={onPrevButtonClick} />
         <NextButton enabled={!nextBtnDisabled} onClick={onNextButtonClick} />
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
            disableRipple={false}
            sx={[styles.btnWrapper, styles.prevButtonWrapper]}
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
            disableRipple={false}
            sx={[styles.btnWrapper, styles.nextButtonWrapper]}
         >
            <ChevronRight />
         </ButtonBase>
      </Fade>
   )
}
