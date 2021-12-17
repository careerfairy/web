import React from "react";
import { darken, makeStyles } from "@material-ui/core/styles";
import {
   Avatar,
   Box,
   Container,
   Grid,
   Hidden,
   Typography,
} from "@material-ui/core";
import CountDown from "./CountDown";
import HeroSpeakers from "./HeroSpeakers";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";
import HeroHosts from "./HeroHosts";
import {
   InPersonEventBadge,
   LimitedRegistrationsBadge,
} from "../../NextLivestreams/GroupStreams/groupStreamCard/badges";

const useStyles = makeStyles((theme) => ({
   root: {
      minHeight: "auto",
      height: "auto",
      position: "relative",
      backgroundSize: "cover",
      zIndex: 2,
      backgroundPosition: "right center",
      backgroundAttachment: "fixed",
      backgroundImage: ({ backgroundImage }) => `url(${backgroundImage});`,
      [theme.breakpoints.up("md")]: {
         minHeight: "100vh",
      },
      "&:after": {
         position: "absolute",
         inset: "0px",
         height: "100%",
         width: "100%",
         content: '" "',
         zIndex: 1,
         backgroundColor: darken(theme.palette.navyBlue.main, 0.5),
         backgroundAttachment: "fixed",
         opacity: 0.7,
      },
   },
   containerWrapper: {
      [theme.breakpoints.up("md")]: {
         position: "absolute",
         top: "50%",
         transform: "translateY(-50%)",
      },
      width: "100%",
      zIndex: 2,
      position: "relative",
      top: 0,
   },
   container: {
      [theme.breakpoints.up("sm")]: {
         paddingTop: theme.spacing(8),
         paddingBottom: theme.spacing(6),
      },
      [theme.breakpoints.up("md")]: {
         paddingTop: theme.spacing(8),
         paddingBottom: theme.spacing(8),
      },
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(4),
   },
   gridContainer: {
      color: theme.palette.common.white,
   },
   leftGridItem: {
      display: "flex",
      justifyContent: "space-evenly",
      flexDirection: "column",
   },
   title: {
      [theme.breakpoints.down("sm")]: {
         fontSize: "calc(1.5em + 1.5vw)",
      },
      fontWeight: 600,
   },
   timerWrapper: {
      display: "flex",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
   companyLogo: {
      padding: theme.spacing(2),
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[4],
      background: theme.palette.common.white,
      width: "fit-content",
      height: "fit-content",
      "& img": {
         borderRadius: theme.spacing(1),
         maxHeight: 90,
         maxWidth: 280,
         objectFit: "contain",
      },
   },
   heroSpeakersWrapper: {
      marginTop: theme.spacing(2),
      color: "inherit",
      textDecoration: "none !important",
   },
   streamStatuses: {
      paddingTop: theme.spacing(2),
      display: "flex",
   },
}));

const HeroSection = ({
   backgroundImage,
   registerButtonLabel,
   onRegisterClick,
   disabled,
   registered,
   stream,
   hosts,
   numberOfSpotsRemaining,
}) => {
   const classes = useStyles({ backgroundImage });

   return (
      <div className={classes.root}>
         <div className={classes.containerWrapper}>
            <Container className={classes.container}>
               <Grid className={classes.gridContainer} spacing={4} container>
                  <Grid className={classes.leftGridItem} item xs={12} md={6}>
                     <Typography variant="h2" className={classes.title}>
                        {stream.title}
                     </Typography>
                     {(stream.isFaceToFace || stream.maxRegistrants) && (
                        <Box className={classes.streamStatuses}>
                           {stream.isFaceToFace && <InPersonEventBadge white />}
                           {stream.maxRegistrants && (
                              <LimitedRegistrationsBadge
                                 white
                                 numberOfSpotsRemaining={numberOfSpotsRemaining}
                              />
                           )}
                        </Box>
                     )}
                     {!!stream.speakers.length && (
                        <Hidden xsDown>
                           <a
                              className={classes.heroSpeakersWrapper}
                              href="#speakers"
                           >
                              <HeroSpeakers speakers={stream.speakers} />
                           </a>
                        </Hidden>
                     )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                     <Grid container spacing={2}>
                        <Grid item xs={12}>
                           <Box display="flex">
                              <Avatar
                                 title={stream.company}
                                 src={getResizedUrl(
                                    stream.companyLogoUrl,
                                    "md"
                                 )}
                                 className={classes.companyLogo}
                              />
                           </Box>
                        </Grid>
                        <Grid item xs={12}>
                           <Box className={classes.timerWrapper}>
                              <CountDown
                                 registerButtonLabel={registerButtonLabel}
                                 time={stream.startDate}
                                 stream={stream}
                                 onRegisterClick={onRegisterClick}
                                 disabled={disabled}
                                 registered={registered}
                              />
                           </Box>
                        </Grid>
                        {!!hosts.length && (
                           <Grid item xs={12}>
                              <HeroHosts hosts={hosts} />
                           </Grid>
                        )}
                     </Grid>
                  </Grid>
               </Grid>
            </Container>
         </div>
      </div>
   );
};

export default HeroSection;
