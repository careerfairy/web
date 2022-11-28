import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import Section from "components/views/common/Section"
import { Box } from "@mui/material"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import UpcomingLivestreamsCarousel from "./UpcomingLivestreamsCarousel"
import Link from "../../../../materialUI/NextNavLink"
import HeroButton from "../HeroSection/HeroButton"
import SectionHeader from "../../common/SectionHeader"
import { ImpressionLocation } from "@careerfairy/shared-lib/dist/livestreams"

const useStyles = makeStyles((theme) => ({
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   title: {
      fontSize: "4.5rem",
      fontWeight: 500,
      [theme.breakpoints.down("sm")]: {
         fontSize: "3.5rem",
      },
   },
}))

const UpcomingLivestreamsSection = (props) => {
   const { getUpcomingLivestreams } = useFirebaseService()
   const [upcomingLivestreams, setUpcomingLivestreams] = useState([])

   useEffect(() => {
      ;(async function () {
         const newStreamSnaps = await getUpcomingLivestreams(15)
         const newStreams = newStreamSnaps.docs
            .map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }))
            .filter((livestream) => !livestream.hidden)
         setUpcomingLivestreams(newStreams)
      })()
   }, [])

   return (
      <Section
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionHeader
            color={props.color}
            title={props.title}
            subtitle={props.subtitle}
         />
         <UpcomingLivestreamsCarousel
            handleOpenJoinModal={props.handleOpenJoinModal}
            upcomingStreams={upcomingLivestreams}
            noRegister
            location={ImpressionLocation.landingPageCarousel}
         />
         <Box display="flex" justifyContent="center" p={2} pt={4}>
            <HeroButton
               href="/next-livestreams"
               component={Link}
               color="secondary"
               withGradient
               variant="contained"
            >
               View Upcoming Livestreams
            </HeroButton>
         </Box>
      </Section>
   )
}

export default UpcomingLivestreamsSection

UpcomingLivestreamsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
