import PropTypes from "prop-types";
import React from "react";
import { useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import Section from "components/views/common/Section";
import { Grid, Hidden } from "@mui/material";
import LaptopVideo from "./LaptopVideo";
import GeneralHeroMessage from "./HeroMessage";
import SectionContainer from "../../common/Section/Container";
import Slide from "@mui/material/Slide";

const useStyles = makeStyles((theme) => ({
   section: {},
   heroContainer: {},
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
      [theme.breakpoints.down('lg')]: {
         justifyContent: "center",
      },
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
   const classes = useStyles();
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
            <Grid className={classes.heroContainer} spacing={2} container>
               <Slide timeout={1000} in direction="right">
                  <Grid
                     className={classes.heroContentWrapper}
                     item
                     xs={12}
                     lg={6}
                  >
                     <GeneralHeroMessage
                        title={title}
                        subTitle={subTitle}
                        buttons={buttons}
                        handleOpenCalendly={handleOpenCalendly}
                     />
                  </Grid>
               </Slide>
               <Hidden lgDown>
                  <Slide timeout={1000} in direction="left">
                     <Grid className={classes.laptopVideoWrapper} item md={6}>
                        <LaptopVideo />
                     </Grid>
                  </Slide>
               </Hidden>
            </Grid>
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
