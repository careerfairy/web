import React from "react"
import { darken } from "@mui/material/styles"
import { Avatar, Box, Container, Grid, Hidden, Typography } from "@mui/material"
import CountDown from "./CountDown"
import HeroSpeakers from "./HeroSpeakers"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import HeroHosts from "./HeroHosts"
import {
   InPersonEventBadge,
   LimitedRegistrationsBadge,
} from "../../NextLivestreams/GroupStreams/groupStreamCard/badges"

const styles = {
   root: (theme) => ({
      minHeight: "auto",
      height: "auto",
      position: "relative",
      backgroundSize: "cover",
      zIndex: 2,
      backgroundPosition: "right center",
      backgroundAttachment: "fixed",
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
   }),
   containerWrapper: (theme) => ({
      [theme.breakpoints.up("md")]: {
         position: "absolute",
         top: "50%",
         transform: "translateY(-50%)",
      },
      width: "100%",
      zIndex: 2,
      position: "relative",
      top: 0,
   }),
   container: (theme) => ({
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
   }),
   gridContainer: {
      color: (theme) => theme.palette.common.white,
   },
   leftGridItem: {
      display: "flex",
      justifyContent: "space-evenly",
      flexDirection: "column",
   },
   title: (theme) => ({
      [theme.breakpoints.down("md")]: {
         fontSize: "calc(1.5em + 1.5vw)",
      },
      fontWeight: 600,
   }),
   timerWrapper: {
      display: "flex",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
   companyLogo: {
      padding: (theme) => theme.spacing(2),
      borderRadius: (theme) => theme.spacing(1),
      boxShadow: (theme) => theme.shadows[4],
      background: (theme) => theme.palette.common.white,
      width: "fit-content",
      height: "fit-content",
      "& img": {
         borderRadius: (theme) => theme.spacing(1),
         maxHeight: 90,
         maxWidth: 280,
         objectFit: "contain",
      },
   },
   heroSpeakersWrapper: {
      marginTop: (theme) => theme.spacing(2),
      color: "inherit",
      textDecoration: "none !important",
      display: "flex",
   },
   streamStatuses: {
      paddingTop: (theme) => theme.spacing(2),
      display: "flex",
   },
}

const HeroSection = ({
   backgroundImage,
   registerButtonLabel,
   onRegisterClick,
   disabled,
   registered,
   stream,
   hosts,
   numberOfSpotsRemaining,
   streamAboutToStart,
}) => {
   return (
      <Box
         sx={[
            styles.root,
            {
               backgroundImage: `url(${backgroundImage});`,
            },
         ]}
      >
         <Box sx={styles.containerWrapper}>
            <Container sx={styles.container}>
               <Grid sx={styles.gridContainer} spacing={2} container>
                  <Grid sx={styles.leftGridItem} item xs={12} md={6}>
                     <Typography
                        variant={stream?.title?.length > 120 ? "h4" : "h2"}
                        sx={styles.title}
                     >
                        {stream.title}
                     </Typography>
                     {(stream.isFaceToFace || stream.maxRegistrants) && (
                        <Box sx={styles.streamStatuses}>
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
                        <Hidden smDown>
                           <Box
                              component="a"
                              sx={styles.heroSpeakersWrapper}
                              href="#speakers"
                           >
                              <HeroSpeakers speakers={stream.speakers} />
                           </Box>
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
                                 sx={styles.companyLogo}
                              />
                           </Box>
                        </Grid>
                        <Grid item xs={12}>
                           <Box sx={styles.timerWrapper}>
                              <CountDown
                                 registerButtonLabel={registerButtonLabel}
                                 time={stream.startDate}
                                 stream={stream}
                                 streamAboutToStart={streamAboutToStart}
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
         </Box>
      </Box>
   )
}

export default HeroSection
