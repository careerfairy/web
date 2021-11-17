import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Typography } from "@material-ui/core";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";
import EventIcon from "@material-ui/icons/Event";
import ClockIcon from "@material-ui/icons/AccessTime";
import DateUtil from "../../../../../util/DateUtil";
import StreamAvatarGroup from "./StreamAvatarGroup";
import { useFirebase } from "../../../../../context/firebase";

const useStyles = makeStyles((theme) => {
   const backgroundImageHeight = "40%";
   const cardBorderRadius = theme.spacing(3);
   return {
      root: {
         maxWidth: 500,
         minWidth: 350,
         background: theme.palette.background.default,
         boxShadow: "none",
         "&:hover": {
            boxShadow: theme.shadows[10],
         },
         position: "relative",
         borderRadius: cardBorderRadius,
         border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
      },
      backgroundImage: {
         position: "absolute",
         top: 0,
         width: "100%",
         height: backgroundImageHeight,
         objectFit: "cover",
         borderRadius: cardBorderRadius,
      },
      companyLogo: {
         maxWidth: "100px",
         maxHeight: "100px",
         objectFit: "cover",
         borderRadius: cardBorderRadius,
         boxShadow: theme.shadows[5],
         background: theme.palette.common.white,
         marginBottom: theme.spacing(2),
      },
      upperContent: {
         padding: theme.spacing(2),
         position: "relative",
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         alignItems: "center",
         paddingTop: backgroundImageHeight,
         [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(4),
         },
         borderRadius: cardBorderRadius,
         background: `linear-gradient(transparent 16%, 27%, ${theme.palette.background.paper} 100%)`,
      },

      lowerContent: {
         padding: theme.spacing(2),
         [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(4),
         },
         background: theme.palette.background.default,
         display: "flex",
         width: "100%",
         borderBottomLeftRadius: cardBorderRadius,
         borderBottomRightRadius: cardBorderRadius,
      },
      eventInfoWrapper: {},
      eventTitle: {
         fontWeight: 550,
         margin: 0,
         display: "-webkit-box",
         boxOrient: "vertical",
         lineClamp: 3,
         WebkitLineClamp: 3,
         wordBreak: "break-word",
         overflow: "hidden",
         height: 80,
      },
      dateInfoWrapper: {
         display: "flex",
         flexWrap: "nowrap",
         alignItems: "center",
      },
      dateInfo: {
         textOverflow: "ellipsis",
         display: "flex",
         color: theme.palette.text.secondary,
         alignItems: "center",
      },
      button: {
         borderRadius: cardBorderRadius,
         padding: theme.spacing(1.5, 6),
      },
   };
});

const UpcomingLivestreamCard = ({ livestream }) => {
   const classes = useStyles();
   const [speakers, setSpeakers] = useState([]);
   const [groups, setGroups] = useState([]);
   const { getFollowingGroupsWithCache } = useFirebase();
   useEffect(() => {
      (async function () {
         if (livestream.groupIds) {
            try {
               const groups = await getFollowingGroupsWithCache(
                  livestream.groupIds
               );
               setGroups(
                  groups.map((group) => ({
                     imageUrl: getResizedUrl(group.backgroundImageUrl, "xs"),
                     alt: `${group.universityName} - logo`,
                  }))
               );
            } catch (e) {
               console.log("-> e in get groups from cache", e);
            }
         }
      })();
   }, []);

   useEffect(() => {
      console.log("-> livestream", livestream);
      if (livestream.speakers) {
         setSpeakers(
            livestream.speakers.map((speaker) => ({
               imageUrl: getResizedUrl(speaker.avatar, "xs"),
               alt: `${speaker.firstName || ""} - ${speaker.lastName || ""}`,
            }))
         );
      }
   }, [livestream.speakers]);

   return (
      <Paper className={classes.root}>
         <img
            className={classes.backgroundImage}
            src={getResizedUrl(livestream.backgroundImageUrl, "md")}
            alt="thumbnail"
         />
         <Box className={classes.upperContent}>
            <img
               alt="company-logo"
               className={classes.companyLogo}
               src={getResizedUrl(livestream.companyLogoUrl, "md")}
            />
            <Box className={classes.eventInfoWrapper}>
               <Typography
                  variant="h5"
                  gutterBottom
                  className={classes.eventTitle}
               >
                  {livestream.title}
               </Typography>
               <Typography
                  gutterBottom
                  className={classes.dateInfo}
                  variant="h6"
               >
                  <EventIcon />
                  &nbsp;
                  {DateUtil.getStreamDate(livestream.start.toDate())}
               </Typography>
               <Typography
                  gutterBottom
                  className={classes.dateInfo}
                  variant="h6"
               >
                  <ClockIcon />
                  &nbsp;
                  {DateUtil.getStreamTime(livestream.start.toDate())}
               </Typography>
               <Box mt={2}>
                  <Button
                     color="primary"
                     fullWidth
                     size="large"
                     variant="outlined"
                     className={classes.button}
                  >
                     Learn More
                  </Button>
               </Box>
            </Box>
            {/*card*/}
         </Box>
         <Box className={classes.lowerContent}>
            <Box border={1} width="40%">
               <StreamAvatarGroup avatars={speakers} max={2} />
            </Box>
            <Box border={1} width="60%">
               <StreamAvatarGroup avatars={groups} max={4} />
            </Box>
         </Box>
      </Paper>
   );
};

export default UpcomingLivestreamCard;
