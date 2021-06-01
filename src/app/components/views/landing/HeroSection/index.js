import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import SectionContainer from "../../common/Section/Container";
import StarsIcon from "@material-ui/icons/Stars";
import Typography from "@material-ui/core/Typography";
import { Grid, Hidden } from "@material-ui/core";
import HeroButton from "./HeroButton";
import {
   calendarIcon,
   laptopDemo,
   playIcon,
} from "../../../../constants/images";

const useStyles = makeStyles((theme) => ({
   section: {
      padding: 0,
   },
   heroGridContainer: {
      minHeight: "calc(100vh - 60px)",
   },
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   starIcon: {
      position: "relative",
      top: "0.1em",
      fontSize: "0.7em",
   },
   buttonsWrapper: {
      marginTop: theme.spacing(10),
      width: "100%",
      display: "flex",
      "& > *:nth-last-child(n+2)": {},
      flexWrap: "wrap",
   },
   heroContent: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   laptopImageWrapper: {
      position: "relative",
   },
   laptopDemoImg: {
      bottom: 0,
      height: "80%",
      position: "absolute",
      left: "30px",
   },
}));

const RockstarText = () => {
   const classes = useStyles();
   return (
      <div>
         r<StarsIcon className={classes.starIcon} />
         ckstars.
      </div>
   );
};

const HeroSection = (props) => {
   const classes = useStyles();
   return (
      <Section
         big={props.big}
         className={classes.section}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionContainer>
            <Grid
               justify="center"
               className={classes.heroGridContainer}
               container
               spacing={2}
            >
               <Grid className={classes.heroContent} xs={12} md={7} item>
                  <Typography variant="h2">
                     Hunt the <b>rising talents</b> and grow them{" "}
                     <b>
                        into <RockstarText />
                     </b>
                  </Typography>
                  <div className={classes.buttonsWrapper}>
                     <HeroButton
                        color="primary"
                        variant="outlined"
                        iconUrl={playIcon}
                     >
                        Our Next Events
                     </HeroButton>
                     <HeroButton
                        color="secondary"
                        withGradient
                        iconUrl={calendarIcon}
                        variant="contained"
                     >
                        Book a Demo
                     </HeroButton>
                  </div>
               </Grid>
               <Hidden smDown>
                  <Grid
                     className={classes.laptopImageWrapper}
                     xs={12}
                     md={5}
                     item
                  >
                     <img
                        className={classes.laptopDemoImg}
                        src={laptopDemo}
                        alt="laptop-demo"
                     />
                  </Grid>
               </Hidden>
            </Grid>
            <SectionHeader
               color={props.color}
               title={props.title}
               subtitle={props.subtitle}
            />
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
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
