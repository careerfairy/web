import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import SectionHeader from "components/views/common/SectionHeader"
import { analyticsSVG } from "../../../../constants/images"
import SectionContainer from "../../common/Section/Container"
import { analyticsShowCaseVideoUrl } from "../../../../constants/videos"
import Fade from "@stahl.luke/react-reveal/Fade"
import LightSpeed from "@stahl.luke/react-reveal/LightSpeed"
import { Box } from "@mui/material"

const styles = {
   section: {
      position: "relative",
   },
   subTitle: {
      color: (theme) => theme.palette.text.secondary,
      fontWeight: 500,
   },
   title: {},
   graphicIllustration: {
      width: "100%",
      height: "auto",
      maxWidth: "600px",
   },
   videoWrapper: (theme) => ({
      zIndex: 1,
      width: "100%",
      height: "auto",
      maxWidth: 1200,
      marginTop: "-2%",
      "& video": {
         borderRadius: "1rem",
         width: "100%",
         boxShadow: theme.shadows[15],
      },
   }),
   imagesWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   analyticsImage: {
      backgroundRepeat: "no-repeat",
      // backgroundPosition: "right bottom",
      backgroundPosition: "right -40vw bottom -40vh",
   },
   backgroundRectangle: {
      position: "absolute",
      bottom: "-13%",
      right: "-50%",
      width: "100%",
      height: "auto",
   },
   dashboardDemoWrapper: {
      width: "100%",
   },
}

const AnalyticsSection = (props) => {
   return (
      <Section
         sx={styles.section}
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImageSx={styles.analyticsImage}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionContainer>
            <Fade right>
               <SectionHeader
                  color={props.color}
                  subTitleSx={styles.subTitle}
                  titleSx={styles.title}
                  title={props.title}
                  subtitle={props.subtitle}
               />
            </Fade>
            <Box sx={styles.imagesWrapper}>
               <LightSpeed left>
                  <Box
                     component="img"
                     sx={styles.graphicIllustration}
                     src={analyticsSVG}
                     alt="analytics"
                  />
               </LightSpeed>
               <Box sx={styles.videoWrapper}>
                  <Fade duration={500} left>
                     <video
                        src={analyticsShowCaseVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                     />
                  </Fade>
               </Box>
            </Box>
         </SectionContainer>
      </Section>
   )
}

export default AnalyticsSection

AnalyticsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
