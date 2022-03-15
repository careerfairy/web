import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import SectionHeader from "components/views/common/SectionHeader"
import { streamerImage } from "../../../../constants/images"
import HighlightText from "../../common/HighlightText"
import SectionContainer from "../../common/Section/Container"
import Fade from "@stahl.luke/react-reveal/Fade"
import { Box } from "@mui/material"

const styles = {
   section: {},
   testimonialsWrapper: {
      display: "flex",
      width: "100%",
   },
   subTitle: {
      color: (theme) => theme.palette.text.secondary,
      fontWeight: 500,
   },
   title: {},
   streamerImage: {
      width: "100%",
      height: "auto",
      maxWidth: "1200px",
      boxShadow: (theme) => theme.shadows[15],
      borderRadius: "1rem",
   },
   imagesWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: (theme) => theme.spacing(2),
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

const StreamSection = (props) => {
   return (
      <Section
         sx={styles.section}
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Box sx={styles.backgroundRectangle} />
         <SectionContainer>
            <Fade left>
               <HighlightText
                  text={"Why use live streams to showcase opportunities?"}
               />
            </Fade>
            <Fade right>
               <SectionHeader
                  color={props.color}
                  subTitleSx={styles.subTitle}
                  titleSx={styles.title}
                  title={props.title}
                  subtitle={props.subtitle}
               />
            </Fade>
            <Fade up>
               <Box sx={styles.imagesWrapper}>
                  <Box
                     component="img"
                     sx={styles.streamerImage}
                     src={streamerImage}
                     alt="analytics"
                  />
               </Box>
            </Fade>
         </SectionContainer>
      </Section>
   )
}

export default StreamSection

StreamSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
