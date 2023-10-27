import { FC, useMemo, useRef } from "react"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import PrevIcon from "@mui/icons-material/ArrowBackIosNew"
import Box from "@mui/material/Box"
import NextIcon from "@mui/icons-material/ArrowForwardIos"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Slider from "react-slick"
import { SxProps, Theme } from "@mui/material/styles"
import useIsMobile from "../../../custom-hook/useIsMobile"

const styles = {
   root: {},
   notCentered: {
      "& .slick-track": {
         mx: 0,
      },
   },
   btnLeft: {
      borderRadius: (theme) => theme.spacing(1, 0, 0, 1),
   },
   btnRight: {
      borderRadius: (theme) => theme.spacing(0, 1, 1, 0),
   },
   btn: {
      width: "100%",
      height: "100%",
      p: 0,
      minWidth: "auto",
      borderRadius: 1,
      "& svg": {
         width: { xs: 20, lg: 25 },
         height: { xs: 20, lg: 25 },
      },
   },
}
const numColumns = 25
const mdItem = 0.7
const smItem = 1
const xsItem = 1.5

const CustomButtonCarousel: FC<Props> = ({
   children,
   numSlides,
   numChildren,
   carouselProps = {},
   carouselStyles,
   shouldCenter = true,
}) => {
   const isMobile = useIsMobile()
   const singleSlide = useMemo(
      () => Boolean(numChildren <= numSlides),
      [numChildren, numSlides]
   )
   const sliderRef = useRef(null)
   const handleNext = () => {
      sliderRef.current?.slickNext()
   }
   const handlePrev = () => {
      sliderRef.current?.slickPrev()
   }

   const getCarouselGridSize = () => ({
      xs: numColumns - xsItem * 2,
      sm: numColumns - smItem * 2,
      md: numColumns - mdItem * 2,
   })
   return (
      <Grid
         sx={[styles.root, !shouldCenter && styles.notCentered]}
         container
         columns={numColumns}
         spacing={0}
      >
         {isMobile ? null : (
            <Grid item xs={xsItem} sm={smItem} md={mdItem}>
               {singleSlide ? null : (
                  <Button
                     color={"grey"}
                     onClick={handlePrev}
                     variant={"text"}
                     disableElevation
                     sx={[styles.btn, styles.btnLeft]}
                  >
                     <PrevIcon />
                  </Button>
               )}
            </Grid>
         )}
         <Grid item {...getCarouselGridSize()} sx={{ maxWidth: "100%" }}>
            <Box
               component={Slider}
               ref={sliderRef}
               arrows={false}
               autoplay={false}
               infinite={true}
               centerMode={true}
               slidesToShow={isMobile && !singleSlide ? 1.1 : numSlides}
               slidesToScroll={numSlides}
               sx={carouselStyles}
               {...carouselProps}
            >
               {children}
            </Box>
         </Grid>
         {isMobile ? null : (
            <Grid item xs={xsItem} sm={smItem} md={mdItem}>
               {singleSlide ? null : (
                  <Button
                     color={"grey"}
                     onClick={handleNext}
                     variant={"text"}
                     disableElevation
                     sx={[styles.btn, styles.btnRight]}
                  >
                     <NextIcon />
                  </Button>
               )}
            </Grid>
         )}
      </Grid>
   )
}
interface Props {
   numSlides: number
   numChildren: number
   carouselProps?: object
   carouselStyles?: SxProps<Theme>
   shouldCenter?: boolean
   hideMobileButtons?: boolean
   children: React.ReactNode
}

export default CustomButtonCarousel
