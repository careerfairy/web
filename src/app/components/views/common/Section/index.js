import PropTypes from "prop-types";
import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import clsx from "clsx";
import { Box } from "@mui/material";
import BackgroundImage from "../BackgroundImage";

const useStyles = makeStyles((theme) => ({
   sectionComponent: {
      transition: theme.transitions.create(["background", "color"], {
         easing: theme.transitions.easing.easeInOut,
         duration: theme.transitions.duration.standard,
      }),
      background: (props) => props.backgroundColor,
      display: "block",
      position: "relative",
      [theme.breakpoints.up("sm")]: {
         paddingTop: (props) => (props.big ? 160 : 60),
         paddingBottom: (props) => (props.big ? 160 : 60),
      },
      [theme.breakpoints.down('md')]: {
         paddingTop: 48,
         paddingBottom: 48,
      },
   },
   isWhite: {
      borderTop: `1px solid ${theme.palette.text.secondary}`,
   },
}));

const Section = (props) => {
   const {
      color,
      backgroundImage,
      backgroundImageOpacity,
      backgroundImageRepeat,
      backgroundImagePosition,
      children,
      backgroundColor,
      backgroundImageClassName,
      big,
      className,
      sectionRef,
      sectionId,
      // Passed to section element
      ...otherProps
   } = props;

   const classes = useStyles({
      backgroundColor: backgroundColor,
      big: big,
   });

   return (
      <section
         className={clsx(classes.sectionComponent, className)}
         ref={sectionRef}
         id={sectionId}
         {...otherProps}
      >
         {props.children}
         {backgroundImage && (
            <BackgroundImage
               className={backgroundImageClassName}
               imagePosition={backgroundImagePosition}
               image={backgroundImage}
               opacity={backgroundImageOpacity}
               repeat={backgroundImageRepeat}
            />
         )}
      </section>
   );
};
Section.propTypes = {
   backgroundImage: PropTypes.string,
   backgroundImageOpacity: PropTypes.number,
   backgroundImageRepeat: PropTypes.bool,
   children: PropTypes.any,
   color: PropTypes.string,
   big: PropTypes.bool,
   className: PropTypes.string,
};

export default Section;
