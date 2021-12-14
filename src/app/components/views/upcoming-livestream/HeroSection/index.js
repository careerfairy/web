import React from "react";
import { darken, makeStyles } from "@material-ui/core/styles";
import { Box, Container, Grid, Hidden, Typography } from "@material-ui/core";
import CountDown from "./CountDown";
import SingleHeroSpeaker from "./SingleHeroSpeaker";
import HeroSpeakers from "./HeroSpeakers";

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
         minHeight: "calc(100vh - 64px);",
      },
      "&:after": {
         position: "absolute",
         inset: "0px",
         height: "100%",
         width: "100%",
         content: '" "',
         zIndex: 1,
         backgroundColor: darken(theme.palette.primary.main, 0.5),
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
      [theme.breakpoints.up("md")]: {
         paddingTop: theme.spacing(8),
         paddingBottom: theme.spacing(8),
      },
      [theme.breakpoints.up("sm")]: {
         paddingTop: theme.spacing(6),
         paddingBottom: theme.spacing(6),
      },
      [theme.breakpoints.up("xs")]: {
         paddingTop: theme.spacing(4),
         paddingBottom: theme.spacing(4),
      },
   },
   gridContainer: {
      color: theme.palette.common.white,
   },
   title: {
      fontWeight: 600,
   },
   subTitle: {
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 5,
      WebkitLineClamp: 5,
      wordBreak: "break-word",
      overflow: "hidden",
   },
   timerWrapper: {
      display: "flex",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
}));
const HeroSection = ({
   backgroundImage,
   title,
   eventStartTime,
   registerButtonLabel,
   onRegisterClick,
   disabled,
   speakers,
   registered,
}) => {
   const classes = useStyles({ backgroundImage });
   return (
      <div className={classes.root}>
         <div className={classes.containerWrapper}>
            <Container className={classes.container}>
               <Grid className={classes.gridContainer} spacing={4} container>
                  <Grid item xs={12} md={6}>
                     <Typography variant="h2" className={classes.title}>
                        {title}
                     </Typography>
                     {!!speakers.length && (
                        <Hidden xsDown>
                           <Box
                              onClick={() => {
                                 // TODO got to speakers section
                              }}
                              marginTop={2}
                           >
                              {speakers.length > 1 ? (
                                 <HeroSpeakers speakers={speakers} />
                              ) : (
                                 <SingleHeroSpeaker speaker={speakers[0]} />
                              )}
                           </Box>
                        </Hidden>
                     )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                     <Box className={classes.timerWrapper}>
                        <CountDown
                           registerButtonLabel={registerButtonLabel}
                           time={eventStartTime}
                           onRegisterClick={onRegisterClick}
                           disabled={disabled}
                           registered={registered}
                        />
                     </Box>
                  </Grid>
               </Grid>
            </Container>
         </div>
      </div>
   );
};

export default HeroSection;
