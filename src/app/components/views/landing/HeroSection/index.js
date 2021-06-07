import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import Typography from "@material-ui/core/Typography";
import { Grid, Hidden } from "@material-ui/core";
import HeroButton from "./HeroButton";
import Link from "materialUI/NextNavLink";
import {
   calendarIcon,
   laptopDemo,
   playIcon,
} from "../../../../constants/images";
import SvgIcon from "@material-ui/core/SvgIcon";
import LaptopVideo from "./LaptopVideo";

const useStyles = makeStyles((theme) => ({
   section: {
      padding: 0,
   },
   linkButton: {
      textDecoration: "none !important",
      background: theme.palette.common.white,
      "&:hover": {
         background: theme.palette.background.paper,
      },
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
      top: "0.03em",
      fontSize: "0.63em",
      margin: "0 0.1em",
   },
   buttonsWrapper: {
      marginTop: theme.spacing(10),
      width: "100%",
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
   laptopVideoWrapper:{
     display: "flex",
     alignItems: "center"
   },
   laptopDemoImg: {
      bottom: 0,
      width: "100%",
      position: "absolute",
      right: 0,
   },
}));

// const RockstarText = () => {
//    const classes = useStyles();
//    return (
//       <div>
//          r<StarsIcon className={classes.starIcon} />
//          ckstars.
//       </div>
//    );
// };
// const RockstarText = () => {
//    const classes = useStyles();
//    return (
//       <div style={{display: "inline-block"}}>
//          <b>
//             fr
//             <StarsIcon className={classes.starIcon} />m
//          </b>
//       </div>
//    );
// };

function AStarIcon(props) {
   return (
      <SvgIcon width="35" height="34" viewBox="0 0 35 34" {...props}>
         <path
            xmlns="http://www.w3.org/2000/svg"
            id="a-star"
            className="cls-1"
            d="M319.873,447.375v6.007a10.384,10.384,0,0,0-4.043-4.7,12.009,12.009,0,0,0-6.54-1.725,13.433,13.433,0,0,0-7.343,2.052,14.075,14.075,0,0,0-5.113,5.887,22.836,22.836,0,0,0,0,18.11,14.04,14.04,0,0,0,5.113,5.917,13.433,13.433,0,0,0,7.343,2.052,12.009,12.009,0,0,0,6.54-1.725,10.373,10.373,0,0,0,4.043-4.7v6.006H329.98V447.375H319.873Zm1.03,14.287-5.2,4.363,1.744,6.127a0.976,0.976,0,0,1-.365,1.054,0.991,0.991,0,0,1-1.123.034l-5.567-3.578-5.567,3.578a1,1,0,0,1-1.124-.034,0.974,0.974,0,0,1-.364-1.054l1.743-6.127-5.2-4.363a0.974,0.974,0,0,1-.3-1.051,0.985,0.985,0,0,1,.868-0.674l6.242-.446,2.808-6.094a0.992,0.992,0,0,1,1.8,0l2.809,6.094,6.241,0.446a0.984,0.984,0,0,1,.868.674A0.974,0.974,0,0,1,320.9,461.662Z"
            transform="translate(-294.969 -446.969)"
         />
      </SvgIcon>
   );
}

const RockstarTextTalent = () => {
   const classes = useStyles();
   return (
      <div style={{ display: "inline-block" }}>
         <b>
            t
            <AStarIcon className={classes.starIcon} />
            lents
         </b>
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
         <Grid className={classes.heroContainer} spacing={2} container>
            <Grid
               className={classes.heroContentWrapper}
               item
               xs={12}
               md={12}
               lg={6}
            >
               <div className={classes.heroContent}>
                  <Typography variant="h2">
                     <b>Engage</b> and recruit <RockstarTextTalent /> from
                     leading <b>schools.</b>
                  </Typography>
                  <Grid
                     spacing={2}
                     container
                     className={classes.buttonsWrapper}
                  >
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
                           onClick={props.handleOpenCalendly}
                           iconUrl={calendarIcon}
                           variant="contained"
                        >
                           Book a Demo
                        </HeroButton>
                     </Grid>
                  </Grid>
               </div>
            </Grid>
            {/*<Hidden mdDown>*/}
            {/*   <Grid*/}
            {/*      className={classes.laptopImageWrapper}*/}
            {/*      item*/}
            {/*      xs={12}*/}
            {/*      md={12}*/}
            {/*      lg={6}*/}
            {/*   >*/}
            {/*      <img*/}
            {/*         className={classes.laptopDemoImg}*/}
            {/*         src={laptopDemo}*/}
            {/*         alt="laptop-demo"*/}
            {/*      />*/}
            {/*   </Grid>*/}
            {/*</Hidden>*/}
            <Grid
               className={classes.laptopVideoWrapper}
               item
               xs={12}
               md={12}
               lg={6}
            >
               <LaptopVideo />
            </Grid>
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
   handleOpenCalendly: PropTypes.func,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
