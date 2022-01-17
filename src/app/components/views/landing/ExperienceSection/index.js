import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import { calendarIcon, ipad } from "../../../../constants/images";
import SectionContainer from "../../common/Section/Container";
import Fade from "@stahl.luke/react-reveal/Fade";
import HeroButton from "../HeroSection/HeroButton";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   section: {},
   testimonialsWrapper: {
      display: "flex",
      width: "100%",
   },
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   title: {},
   streamerImage: {
      width: "100%",
      height: "auto",
      maxWidth: 800,
      boxShadow: theme.shadows[15],
      borderRadius: "1rem",
   },
   imagesWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: theme.spacing(2),
   },
   imageText: {
      margin: 50,
      textAlign: "center",
      fontSize: "1rem",
   },
   bookingButton: {
      background: theme.palette.common.white,
      color: theme.palette.secondary.main,
      "&:hover": {
         color: theme.palette.common.white,
      },
   },
   backgroundRectangle: {
      top: 0,
      position: "absolute",
      width: "100%",
      height: "100%",
      opacity: 0.35,
      right: "4%",
      [theme.breakpoints.down("md")]: {
         right: theme.spacing(1),
      },
      [theme.breakpoints.down("sm")]: {
         borderRadius: theme.spacing(0, 5, 5, 0),
      },
      borderRadius: theme.spacing(0, 10, 10, 0),
      background:
         "radial-gradient(closest-corner at 60% 55%, #E8FFFC, #CEDDF2)",
   },
}));

const ExperienceSection = (props) => {
   const classes = useStyles();
   return (
      <Section
         className={classes.section}
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <div className={classes.backgroundRectangle} />
         <SectionContainer>
            <Fade up>
               <div className={classes.imagesWrapper}>
                  <img
                     className={classes.streamerImage}
                     src={getResizedUrl(ipad, "md")}
                     alt="analytics"
                     loading="lazy"
                  />
               </div>
            </Fade>
            <Fade left>
               <p className={classes.imageText}>
                  During a livestream, one or more employees of a company gives
                  students insights into their daily work and answer all of
                  their questions about the reality on the job.
               </p>
               <HeroButton
                  color="secondary"
                  fullWidth
                  withGradient
                  onClick={props.handleOpenCalendly}
                  iconUrl={calendarIcon}
                  variant="contained"
               >
                  Get in touch
               </HeroButton>
            </Fade>
         </SectionContainer>
      </Section>
   );
};

export default ExperienceSection;

ExperienceSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
