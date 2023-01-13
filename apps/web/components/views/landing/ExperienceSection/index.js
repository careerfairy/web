import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import { calendarIcon, ipad } from "../../../../constants/images"
import SectionContainer from "../../common/Section/Container"
import Fade from "@stahl.luke/react-reveal/Fade"
import HeroButton from "../HeroSection/HeroButton"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { Box, Typography } from "@mui/material"
import { hubSpotFunnelLinkCareerCenter } from "../../../../constants/links"

const styles = {
   streamerImage: {
      width: "100%",
      height: "auto",
      maxWidth: 800,
      boxShadow: (theme) => theme.shadows[15],
      borderRadius: "1rem",
   },
   imagesWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: (theme) => theme.spacing(2),
   },
   imageText: {
      margin: "50px",
      textAlign: "center",
      fontSize: "1rem",
   },
   backgroundRectangle: (theme) => ({
      top: 0,
      position: "absolute",
      width: "100%",
      height: "100%",
      opacity: 0.35,
      right: "4%",
      [theme.breakpoints.down("lg")]: {
         right: theme.spacing(1),
      },
      [theme.breakpoints.down("md")]: {
         borderRadius: theme.spacing(0, 5, 5, 0),
      },
      borderRadius: theme.spacing(0, 10, 10, 0),
      background:
         "radial-gradient(closest-corner at 60% 55%, #E8FFFC, #CEDDF2)",
   }),
}

const ExperienceSection = (props) => {
   return (
      <Section
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Box sx={styles.backgroundRectangle} />
         <SectionContainer>
            <Fade up>
               <Box sx={styles.imagesWrapper}>
                  <Box
                     component="img"
                     sx={styles.streamerImage}
                     src={getResizedUrl(ipad, "md")}
                     alt="analytics"
                     loading="lazy"
                  />
               </Box>
            </Fade>
            <Fade left>
               <Typography sx={styles.imageText}>
                  During a livestream, one or more employees of a company gives
                  students insights into their daily work and answer all of
                  their questions about the reality on the job.
               </Typography>
               <HeroButton
                  color="secondary"
                  fullWidth
                  withGradient
                  target="_blank"
                  href={hubSpotFunnelLinkCareerCenter}
                  iconUrl={calendarIcon}
                  variant="contained"
               >
                  Get in touch
               </HeroButton>
            </Fade>
         </SectionContainer>
      </Section>
   )
}

export default ExperienceSection

ExperienceSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
