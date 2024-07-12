import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import Slider from "react-slick"
import "slick-carousel/slick/slick-theme.css"
import "slick-carousel/slick/slick.css"
import { getMaxSlides } from "util/CommonUtil"
import UpcomingLivestreamCard from "../../../common/stream-cards/UpcomingLivestreamCard"

const styles = {
   root: (theme) => ({
      marginLeft: "auto",
      marginRight: "auto",
      width: "95%",
      [theme.breakpoints.down("lg")]: {
         width: "100%",
      },
      "& .slick-dots li.slick-active button:before": {
         background: theme.palette.primary.main,
      },
      "& .slick-dots button:before": {
         width: "0.5rem",
         height: "0.5rem",
         border: `1px solid ${theme.palette.primary.main}`,
         borderRadius: "100%",
         content: '""',
      },
   }),
}
type Props = {
   upcomingStreams: LivestreamEvent[]
   handleOpenJoinModal?: (any) => void
   additionalSettings?: { [key: string]: any }
   disableAutoPlay?: boolean
   noRegister?: boolean
   location: ImpressionLocation
}
const UpcomingLivestreamsCarousel = ({
   upcomingStreams,
   handleOpenJoinModal,
   additionalSettings,
   disableAutoPlay,
   noRegister,
   location = ImpressionLocation.unknown,
}: Props) => {
   const settings = {
      infinite: true,
      speed: 500,
      lazyLoad: true,
      arrows: false,
      autoplay: !disableAutoPlay,
      autoplaySpeed: 10000,
      dots: true,
      pauseOnHover: true,
      slidesToShow: getMaxSlides(4, upcomingStreams.length),
      slidesToScroll: getMaxSlides(4, upcomingStreams.length),
      initialSlide: 0,
      responsive: [
         {
            breakpoint: 1400,
            settings: {
               slidesToShow: getMaxSlides(3, upcomingStreams.length),
               slidesToScroll: getMaxSlides(3, upcomingStreams.length),
               infinite: true,
            },
         },
         {
            breakpoint: 1024,
            settings: {
               slidesToShow: getMaxSlides(2, upcomingStreams.length),
               slidesToScroll: getMaxSlides(2, upcomingStreams.length),
               dots: true,
               infinite: true,
            },
         },
         {
            breakpoint: 600,
            settings: {
               slidesToShow: 1,
               dots: true,
               slidesToScroll: 1,
            },
         },
      ],
      ...additionalSettings,
   }

   return (
      <Box sx={styles.root}>
         <Slider {...settings}>
            {upcomingStreams.map((livestream, index, arr) => (
               <Box key={livestream.id} p={2}>
                  <UpcomingLivestreamCard
                     handleOpenJoinModal={handleOpenJoinModal}
                     livestream={livestream}
                     disableExpand
                     noRegister={noRegister}
                     index={index}
                     totalElements={arr.length}
                     location={location}
                  />
               </Box>
            ))}
         </Slider>
      </Box>
   )
}

export default UpcomingLivestreamsCarousel
