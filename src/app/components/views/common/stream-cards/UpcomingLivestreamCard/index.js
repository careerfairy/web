import React, { useEffect, useState } from "react";
import { Box, Button, Collapse, Paper, Typography } from "@material-ui/core";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";
import EventIcon from "@material-ui/icons/Event";
import ClockIcon from "@material-ui/icons/AccessTime";
import DateUtil from "../../../../../util/DateUtil";
import debounce from "lodash.debounce";

import { useFirebase } from "../../../../../context/firebase";
import clsx from "clsx";
import LowerPreviewContent from "./LowerPreviewContent";
import LowerMainContent from "./LowerMainContent";

const useStyles = makeStyles((theme) => {
   const backgroundImageHeight = 200;
   const cardBorderRadius = theme.spacing(3);
   return {
      root: {
         background: theme.palette.background.default,
         boxShadow: "none",
         "&:hover": {
            boxShadow: theme.shadows[10],
         },
         position: "relative",
         borderRadius: cardBorderRadius,
         border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
         display: "flex",
         overflow: "hidden",
         flexDirection: "column",
         height: theme.spacing(70),
         transition: theme.transitions.create(
            ["transform", "box-shadow", "all"],
            {
               easing: theme.transitions.easing.easeInOut,
               duration: theme.transitions.duration.standard,
            }
         ),
         "&::-webkit-scrollbar": {
            height: 5,
         },
         "&::-webkit-scrollbar-track": {
            background: theme.palette.common.black,
         },
         "&::-webkit-scrollbar-thumb": {
            borderRadius: cardBorderRadius,
            background: theme.palette.primary.main,
         },
      },
      rootHovered: {},
      backgroundImage: {
         position: "absolute",
         width: "100%",
         height: backgroundImageHeight,
         transition: theme.transitions.create(["height", "transform"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
         objectFit: "cover",
         borderRadius: cardBorderRadius,
      },
      backgroundImageHovered: {
         transform: "scale(1.25)",
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
      contentWrapper: {
         position: "absolute",
         left: 0,
         width: "100%",
         top: backgroundImageHeight - 50,
         transition: theme.transitions.create(["top", "bottom"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      },
      contentWrapperHovered: {
         top: 0,
      },
      upperContent: {
         padding: theme.spacing(2),
         position: "relative",
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         background: `linear-gradient(transparent 9%, 18%, ${theme.palette.background.paper} 43%)`,
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
      upperContentHovered: {},
      lowerContent: {
         background: theme.palette.background.default,
         display: "flex",
         maxHeight: backgroundImageHeight + 25,
         "&::-webkit-scrollbar": {
            width: 8,
         },
         "&::-webkit-scrollbar-track": {
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
            webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
         },
         "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.primary.light,
            borderRadius: 7,
         },
         overflowY: "auto",
         width: "100%",
         flexDirection: "column",
         borderBottomLeftRadius: cardBorderRadius,
         borderBottomRightRadius: cardBorderRadius,
         position: "relative",
         padding: theme.spacing(2),
      },

      eventInfoWrapper: {
         width: "100%",
      },
      eventTitle: {
         fontWeight: 550,
         margin: 0,
         boxOrient: "vertical",
         wordBreak: "break-word",
         lineClamp: 2,
         overflow: "hidden",
         display: "-webkit-box",
         WebkitBoxOrient: "vertical",
         WebkitLineClamp: 2,
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

const throttle_speed = 50;
const UpcomingLivestreamCard = ({ livestream }) => {
   const [hovered, setHovered] = useState(false);
   const classes = useStyles();
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
                     imgPath: getResizedUrl(group.logoUrl, "xs"),
                     label: `${group.universityName} - logo`,
                     id: group.id,
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
               label: `${speaker.firstName} ${speaker.lastName}`,
               imgPath: getResizedUrl(speaker.avatar, "xs"),
               subLabel: `${speaker.position}`,
               id: speaker.id,
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
            className={clsx(classes.backgroundImage, {
               [classes.backgroundImageHovered]: hovered,
            })}
            src={getResizedUrl(livestream.backgroundImageUrl, "sm")}
            alt="thumbnail"
            loading="lazy"
         />
         <div
            className={clsx(classes.contentWrapper, {
               [classes.contentWrapperHovered]: hovered,
            })}
         >
            <Box
               className={clsx(classes.upperContent, {
                  [classes.upperContentHovered]: hovered,
               })}
            >
               <img
                  alt="company-logo"
                  className={clsx(classes.companyLogo, {
                     [classes.companyLogoHovered]: hovered,
                  })}
                  loading="lazy"
                  src={getResizedUrl(livestream.companyLogoUrl, "md")}
               />
               <Box className={classes.eventInfoWrapper}>
                  <Box height={56}>
                     <Typography
                        variant="h5"
                        gutterBottom
                        className={classes.eventTitle}
                     >
                        {livestream.title}
                     </Typography>
                  </Box>
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
            <Collapse collapsedSize={80} in={hovered}>
               <Box className={classes.lowerContent}>
                  {!hovered && (
                     <LowerPreviewContent speakers={speakers} groups={groups} />
                  )}
                  {hovered && (
                     <LowerMainContent
                        groups={groups}
                        livestream={livestream}
                     />
                  )}
               </Box>
            </Collapse>
         </div>
      </Paper>
   );
};

export default UpcomingLivestreamCard;
