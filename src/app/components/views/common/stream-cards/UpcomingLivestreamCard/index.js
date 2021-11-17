import React, { useEffect, useState } from "react";
import { Box, Button, Collapse, Paper, Typography } from "@material-ui/core";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";
import EventIcon from "@material-ui/icons/Event";
import ClockIcon from "@material-ui/icons/AccessTime";
import DateUtil from "../../../../../util/DateUtil";
import StreamAvatarGroup from "./StreamAvatarGroup";
import debounce from "lodash.debounce";

import { useFirebase } from "../../../../../context/firebase";
import clsx from "clsx";
import SpeakerInfo from "./SpeakerInfo";

const useStyles = makeStyles((theme) => {
   const backgroundImageHeight = 200;
   const cardBorderRadius = theme.spacing(3);
   return {
      root: {
         background: theme.palette.background.default,
         boxShadow: "none",
         "&:hover": {
            boxShadow: theme.shadows[7],
         },
         position: "relative",
         borderRadius: cardBorderRadius,
         border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
         display: "flex",
         flexDirection: "column",
         transition: theme.transitions.create(["transform", "box-shadow"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      },
      rootHovered: {},
      backgroundImage: {
         position: "absolute",
         width: "100%",
         height: backgroundImageHeight,
         transition: theme.transitions.create(["height"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
         objectFit: "cover",
         borderRadius: cardBorderRadius,
      },
      companyLogo: {
         maxWidth: "80%",
         marginTop: `-20px`,

         maxHeight: "100px",
         objectFit: "cover",
         borderRadius: cardBorderRadius,
         boxShadow: theme.shadows[5],
         background: theme.palette.common.white,
         marginBottom: theme.spacing(2),
         padding: theme.spacing(2),
         transition: theme.transitions.create(["box-shadow"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      },
      companyLogoHovered: {
         boxShadow: theme.shadows[10],
      },
      upperContent: {
         padding: theme.spacing(2),
         position: "relative",
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         background: `linear-gradient(transparent 9%, 18%, ${theme.palette.background.paper} 43%)`,

         paddingTop: `calc(${backgroundImageHeight}px - 50px) !important`,
         alignItems: "center",
         transition: theme.transitions.create(["padding-top", "background"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
         [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(3),
         },
         borderRadius: cardBorderRadius,
      },
      upperContentHovered: {
         paddingTop: `70px !important`,
      },
      lowerContent: {
         background: theme.palette.background.default,
         display: "flex",
         width: "100%",
         flexDirection: "column",
         borderBottomLeftRadius: cardBorderRadius,
         borderBottomRightRadius: cardBorderRadius,
         position: "relative",
      },
      lowerMiniWrapper: {
         display: "flex",
         width: "100%",
         padding: theme.spacing(2),
         [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(4),
         },
      },
      lowerBigWrapper: {
         background: "inherit",
         borderRadius: cardBorderRadius,
         opacity: 0,
         transition: theme.transitions.create(["opacity"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      },
      lowerBigWrapperHovered: {
         padding: theme.spacing(2),
         [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(4),
         },
         opacity: 1,
      },
      eventInfoWrapper: {
         width: "100%",
      },
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
      miniSpeakersWrapper: {
         display: "flex",
         flexWrap: "nowrap",
         width: "40%",
      },
      miniGroupsWrapper: {
         display: "flex",
         flexWrap: "nowrap",
         width: "60%",
      },
   };
});

const throttle_speed = 100;
const UpcomingLivestreamCard = ({ livestream }) => {
   const [hovered, setHovered] = useState(false);
   const classes = useStyles();
   const [fullyCollapsed, setFullyCollapsed] = useState(false);
   const [speakers, setSpeakers] = useState([]);
   const [groups, setGroups] = useState([]);

   const handleMouseEnter = debounce(() => setHovered(true), throttle_speed);
   const handleMouseLeave = debounce(() => setHovered(false), throttle_speed);

   const { getFollowingGroupsWithCache } = useFirebase();

   useEffect(() => {
      (async function () {
         if (livestream.groupIds) {
            try {
               const newGroups = await getFollowingGroupsWithCache(
                  livestream.groupIds
               );
               setGroups(
                  newGroups.map((group) => ({
                     imageUrl: getResizedUrl(group.logoUrl, "xs"),
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
      <Paper
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         className={clsx(classes.root, {
            [classes.rootHovered]: hovered,
         })}
      >
         <img
            className={classes.backgroundImage}
            src={getResizedUrl(livestream.backgroundImageUrl, "md")}
            alt="thumbnail"
         />
         <Box
            className={clsx(classes.upperContent, {
               [classes.upperContentHovered]: hovered && fullyCollapsed,
            })}
         >
            <img
               alt="company-logo"
               className={clsx(classes.companyLogo, {
                  [classes.companyLogoHovered]: hovered,
               })}
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
         </Box>
         <Box className={classes.lowerContent}>
            <Collapse in={!hovered}>
               {!hovered && (
                  <Box className={classes.lowerMiniWrapper}>
                     <Box className={classes.miniSpeakersWrapper}>
                        <StreamAvatarGroup avatars={speakers} max={3} />
                     </Box>
                     {!!groups.length && (
                        <Box className={classes.miniGroupsWrapper}>
                           <StreamAvatarGroup isLogo avatars={groups} max={5} />
                        </Box>
                     )}
                  </Box>
               )}
            </Collapse>
            <Box
               className={clsx(classes.lowerBigWrapper, {
                  [classes.lowerBigWrapperHovered]: hovered,
               })}
            >
               <Collapse
                  onEntered={() => setFullyCollapsed(true)}
                  onExited={() => setFullyCollapsed(false)}
                  in={hovered}
               >
                  {livestream.speakers.map((speaker) => (
                     <SpeakerInfo key={speaker.id} speaker={speaker} />
                  ))}
               </Collapse>
            </Box>
         </Box>
      </Paper>
   );
};

export default UpcomingLivestreamCard;
