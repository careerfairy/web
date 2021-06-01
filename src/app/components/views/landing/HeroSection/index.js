import PropTypes from "prop-types";
import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import SectionContainer from "../../common/Section/Container";
import StarsIcon from "@material-ui/icons/Stars";
import Typography from "@material-ui/core/Typography";
import { Grid, Hidden, useMediaQuery } from "@material-ui/core";
import HeroButton from "./HeroButton";
import Link from "materialUI/NextNavLink";
import {
   calendarIcon,
   laptopDemo,
   playIcon,
} from "../../../../constants/images";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   section: {
      padding: 0,
   },
   linkButton: {
      textDecoration: "none !important",
   },
   heroContainer: {
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
      // display: "flex",
      // justifyContent: "space-around",
      "& > *": {
         // marginTop: theme.spacing(1),
         // marginBottom: theme.spacing(1),
      },
      "& > *:nth-last-child(n+2)": {
         // marginRight: theme.spacing(2)
         // margin: theme.spacing(2, 2, 2, 0),
         // [theme.breakpoints.down("xs")]: {
         //    margin: theme.spacing(1, 1, 1, 0),
         // }
      },
      flexWrap: "wrap",
   },
   heroContent: {
      padding: theme.spacing(0, 5),
      maxWidth: 780,
   },
   heroContentWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
   },
   laptopImageWrapper: {
      position: "relative",
   },
   laptopDemoImg: {
      bottom: 0,
      width: "100%",
      position: "absolute",
      right: 0,
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
   const theme = useTheme();
   const desktop = useMediaQuery(theme.breakpoints.up("md"));
   console.log("-> desktop", desktop);
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
         <Grid className={classes.heroContainer} container>
            <Grid
               className={classes.heroContentWrapper}
               item
               xs={12}
               md={12}
               lg={6}
            >
               <div className={classes.heroContent}>
                  <Typography variant="h2">
                     Hunt the <b>rising talents</b> and grow them{" "}
                     <b>
                        into <RockstarText />
                     </b>
                  </Typography>
                  <Grid spacing={2} container className={classes.buttonsWrapper}>
                     <Grid xs={12} sm={12} md={6} item>
                     <HeroButton
                        color="primary"
                        variant="outlined"
                        fullWidth
                        href="/next-livestreams"
                        className={classes.linkButton}
                        component={Link}
                        iconUrl={playIcon}
                     >
                        Our Next Events
                     </HeroButton>
                     </Grid>
                     <Grid xs={12} sm={12} md={6} item>
                     <HeroButton
                        color="secondary"
                        fullWidth
                        withGradient
                        iconUrl={calendarIcon}
                        variant="contained"
                     >
                        Book a Demo
                     </HeroButton>
                     </Grid>
                  </Grid>
               </div>
            </Grid>
            <Hidden mdDown>
               <Grid
                  className={classes.laptopImageWrapper}
                  item
                  xs={12}
                  md={12}
                  lg={6}
               >
                  <img
                     className={classes.laptopDemoImg}
                     src={laptopDemo}
                     alt="laptop-demo"
                  />
               </Grid>
            </Hidden>
         </Grid>
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
