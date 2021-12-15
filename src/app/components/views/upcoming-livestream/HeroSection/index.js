import React from "react";
import { darken, makeStyles } from "@material-ui/core/styles";
import {
   Avatar,
   Box,
   Container,
   Grid,
   Hidden,
   Paper,
   Typography,
} from "@material-ui/core";
import CountDown from "./CountDown";
import SingleHeroSpeaker from "./SingleHeroSpeaker";
import HeroSpeakers from "./HeroSpeakers";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";

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
      [theme.breakpoints.down("sm")]: {
         fontSize: "calc(1.5em + 1.5vw)",
      },
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
   companyLogo: {
      padding: theme.spacing(0.5),
      borderRadius: theme.spacing(1),
      width: 300,
      height: 90,
      [theme.breakpoints.down("sm")]: {
         width: "100%",
      },
      boxShadow: theme.shadows[4],
      background: theme.palette.common.white,
      "& img": {
         objectFit: "contain",
      },
   },
   hostsCard: {
      display: "flex",
      flexDirection: "column",
      borderRadius: theme.spacing(1),
      padding: theme.spacing(2),
      width: "fit-content",
   },
   hostsLogoWrapper: {},
   hostLogo: {
      padding: theme.spacing(0.5),
      borderRadius: theme.spacing(1),
      width: 300,
      height: 90,
      [theme.breakpoints.down("sm")]: {
         width: "100%",
      },
      background: theme.palette.common.white,
      "& img": {
         objectFit: "contain",
      },
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
}) => {
   const classes = useStyles({ backgroundImage });

   return (
      <div className={classes.root}>
         <div className={classes.containerWrapper}>
            <Container className={classes.container}>
               <Grid className={classes.gridContainer} spacing={4} container>
                  <Grid item xs={12} md={6}>
                     <Typography variant="h2" className={classes.title}>
                        {stream.title}
                     </Typography>
                     {!!stream.speakers.length && (
                        <Hidden xsDown>
                           <Box
                              onClick={() => {
                                 // TODO got to speakers section
                              }}
                              marginTop={2}
                           >
                              {stream.speakers.length > 1 ? (
                                 <HeroSpeakers speakers={stream.speakers} />
                              ) : (
                                 <SingleHeroSpeaker
                                    speaker={stream.speakers[0]}
                                 />
                              )}
                           </Box>
                        </Hidden>
                     )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                     <Grid container spacing={2}>
                        <Grid item xs={12}>
                           <Box display="flex" justifyContent="center">
                              <Avatar
                                 className={classes.companyLogo}
                                 src={getResizedUrl(
                                    stream.companyLogoUrl,
                                    "md"
                                 )}
                                 title={stream.company}
                              />
                           </Box>
                        </Grid>
                        <Grid item xs={12}>
                           <Box className={classes.timerWrapper}>
                              <CountDown
                                 registerButtonLabel={registerButtonLabel}
                                 time={stream.startDate}
                                 onRegisterClick={onRegisterClick}
                                 disabled={disabled}
                                 registered={registered}
                              />
                           </Box>
                        </Grid>
                        {/*<Grid item xs={12}>*/}
                        {/*   <Paper className={classes.hostsCard}>*/}
                        {/*      <Typography variant="body1" color="textSecondary">*/}
                        {/*         Hosted by*/}
                        {/*      </Typography>*/}
                        {/*      <div className={classes.hostsLogoWrapper}>*/}
                        {/*         {hosts.map((host) => (*/}
                        {/*            <Avatar*/}
                        {/*               key={host.id}*/}
                        {/*               className={classes.hostLogo}*/}
                        {/*               src={getResizedUrl(host.logoUrl, "md")}*/}
                        {/*               title={host.universityName}*/}
                        {/*            />*/}
                        {/*         ))}*/}
                        {/*      </div>*/}
                        {/*   </Paper>*/}
                        {/*</Grid>*/}
                     </Grid>
                  </Grid>
               </Grid>
            </Container>
         </div>
      </div>
   );
};

export default HeroSection;
