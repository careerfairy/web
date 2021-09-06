import PropTypes from "prop-types";
import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import { Grid } from "@material-ui/core";
import LaptopVideo from "./LaptopVideo";
import Fade from "react-reveal/Fade";
import HeroMessage from "./HeroMessage";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
   section: {
      // padding: 0,
   },
   heroContainerWrapper: {
      // height: "calc(100vh - 60px)",
      display: "flex",
      justifyContent: "center",
      alignItems: (props) => (props.mobile ? "flex-start" : "center"),
   },
   heroContainer: {
      maxWidth: "90%",
   },
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },

   heroContent: {
      padding: theme.spacing(0, 5),
      maxWidth: 780,
   },
   heroContentWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
   },
   laptopVideoWrapper: {
      display: "flex",
      alignItems: "flex-end",
   },
}));

const HeroSection = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   handleOpenCalendly,
   title,
}) => {
   const theme = useTheme();
   const mobile = useMediaQuery(theme.breakpoints.down("sm"));
   const classes = useStyles({ mobile });
   const [itemProps] = useState({
      item: true,
      xs: 12,
      md: 6,
      lg: 6,
   });

   return (
      <Section
         big={big}
         className={classes.section}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <div className={classes.heroContainerWrapper}>
            <Grid className={classes.heroContainer} spacing={2} container>
               <Grid className={classes.heroContentWrapper} {...itemProps}>
                  <Fade down>
                     {mobile ? (
                        <LaptopVideo />
                     ) : (
                        <HeroMessage
                           mobile={mobile}
                           title={title}
                           handleOpenCalendly={handleOpenCalendly}
                        />
                     )}
                  </Fade>
               </Grid>
               <Grid className={classes.laptopVideoWrapper} {...itemProps}>
                  <Fade up>
                     {mobile ? (
                        <HeroMessage
                           mobile={mobile}
                           title={title}
                           handleOpenCalendly={handleOpenCalendly}
                        />
                     ) : (
                        <LaptopVideo />
                     )}
                  </Fade>
               </Grid>
            </Grid>
         </div>
      </Section>
   );
};

export default HeroSection;

HeroSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   handleOpenCalendly: PropTypes.func,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
