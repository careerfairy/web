import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import { analyticsSVG } from "../../../../constants/images";
import clsx from "clsx";
import SectionContainer from "../../common/Section/Container";
import { analyticsShowCaseVideoUrl } from "../../../../constants/videos";
import Fade from "react-reveal/Fade";
import LightSpeed from "react-reveal/LightSpeed";

const useStyles = makeStyles((theme) => ({
   section: {
      position: "relative",
   },
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   title: {},
   graphicIllustration: {
      width: "100%",
      height: "auto",
      maxWidth: 600,
   },
   analyticsPreviewImage: {

   },
   videoWrapper: {
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
   },
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
}));

const AnalyticsSection = (props) => {
   const classes = useStyles();

   return (
      <Section
         className={classes.section}
         big={props.big}
         color={props.color}
         backgroundImageClassName={clsx(
            props.backgroundImageClassName,
            classes.analyticsImage
         )}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         {/*<img*/}
         {/*   className={classes.backgroundRectangle}*/}
         {/*   alt="background-rectangle"*/}
         {/*   src={rectangle1}*/}
         {/*/>*/}
         <SectionContainer>
            <Fade right>
            <SectionHeader
               color={props.color}
               subTitleClassName={classes.subTitle}
               titleClassName={classes.title}
               title={props.title}
               subtitle={props.subtitle}
            />
            </Fade>
            <div className={classes.imagesWrapper}>
               <LightSpeed left>
                  <img
                     className={classes.graphicIllustration}
                     src={analyticsSVG}
                     alt="analytics"
                  />
               </LightSpeed>
               <div className={classes.videoWrapper}>
                  <Fade duration={500} left>
                     <video
                        src={analyticsShowCaseVideoUrl}
                        autoPlay
                        muted
                        loop
                     />
                  </Fade>
               </div>
            </div>
         </SectionContainer>
      </Section>
   );
};

export default AnalyticsSection;

AnalyticsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
