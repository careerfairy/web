import PropTypes from "prop-types";
import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import { Grid, Hidden } from "@material-ui/core";
import LaptopVideo from "./LaptopVideo";
import Fade from "react-reveal/Fade";
import GeneralHeroMessage from "./HeroMessage";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import SectionContainer from "../../common/Section/Container";

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
      // maxWidth: "90%",
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
      justifyContent: "flex-end",
      alignItems: "flex-end",
   },
   laptopVideoWrapper: {
      display: "flex",
      alignItems: "center",
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
   buttons,
   title,
   subTitle,
}) => {
   const theme = useTheme();
   const mobile = useMediaQuery(theme.breakpoints.down("sm"));
   const classes = useStyles({ mobile });

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
         <SectionContainer maxWidth="xl">
            <div className={classes.heroContainerWrapper}>
               <Grid className={classes.heroContainer} spacing={2} container>
                  <Grid
                     className={classes.heroContentWrapper}
                     item
                     xs={12}
                     lg={6}
                  >
                     <Fade down>
                        <GeneralHeroMessage
                           mobile={mobile}
                           title={title}
                           subTitle={subTitle}
                           buttons={buttons}
                           handleOpenCalendly={handleOpenCalendly}
                        />
                     </Fade>
                  </Grid>
                  <Hidden mdDown>
                     <Grid className={classes.laptopVideoWrapper} item md={6}>
                        <Fade up>
                           <LaptopVideo />
                        </Fade>
                     </Grid>
                  </Hidden>
               </Grid>
            </div>
         </SectionContainer>
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
