import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import { Container, Typography } from "@material-ui/core";
import SectionHeader from "components/views/common/SectionHeader";
import { streamerImage } from "../../../../constants/images";

const useStyles = makeStyles((theme) => ({
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   section: {},
   bookingButton: {
      background: theme.palette.common.white,
      color: theme.palette.secondary.main,
      "&:hover": {
         color: theme.palette.common.white,
      },
   },
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
      maxWidth: 1200,
      boxShadow: theme.shadows[15],
   },
   imagesWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
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
   HighlightTag: {
      background: theme.palette.secondary.light,
      padding: theme.spacing(1),
      color: theme.palette.common.white,
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(1),
   },
}));

const StreamSection = (props) => {
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
         <Container className={classes.container}>
            <div className={classes.HighlightTag}>
               <Typography variant="body2">
                  Why use live streams to showcase your opportunities?
               </Typography>
            </div>
            <SectionHeader
               color={props.color}
               subTitleClassName={classes.subTitle}
               titleClassName={classes.title}
               title={props.title}
               subtitle={props.subtitle}
            />
            <div className={classes.imagesWrapper}>
               <img
                  className={classes.streamerImage}
                  src={streamerImage}
                  alt="analytics"
               />
            </div>
         </Container>
      </Section>
   );
};

export default StreamSection;

StreamSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
