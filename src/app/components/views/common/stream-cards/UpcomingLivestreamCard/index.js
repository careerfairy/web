import React, { useEffect, useMemo, useState } from "react";
import {
   Avatar,
   Box,
   Button,
   ButtonGroup,
   Collapse,
   Paper,
   Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";
import EventIcon from "@mui/icons-material/Event";
import ClockIcon from "@mui/icons-material/AccessTime";
import DateUtil from "../../../../../util/DateUtil";
import Link from "materialUI/NextNavLink";
import debounce from "lodash.debounce";

import { useFirebase } from "../../../../../context/firebase";
import clsx from "clsx";
import LowerPreviewContent from "./LowerPreviewContent";
import LowerMainContent from "./LowerMainContent";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import { speakerPlaceholder } from "../../../../util/constants";
import UserUtil from "../../../../../data/util/UserUtil";
import { useRouter } from "next/router";
import { FORTY_FIVE_MINUTES_IN_MILLISECONDS } from "../../../../../data/constants/streamContants";
import useMediaQuery from "@mui/material/useMediaQuery";

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
      rootLandscape: {
         height: theme.spacing(36),
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
         marginTop: `-20px`,
         borderRadius: cardBorderRadius,
         height: 100,
         width: "80%",
         boxShadow: theme.shadows[5],
         background: theme.palette.common.white,
         marginBottom: theme.spacing(2),
         "& img": {
            maxHeight: "80%",
            maxWidth: "80%",
            objectFit: "contain",
         },
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
      contentWrapperLandscape: {
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
         color: theme.palette.text.secondary,
         alignItems: "center",
         lineClamp: 1,
         overflow: "hidden",
         display: "flex",
         WebkitBoxOrient: "vertical",
         WebkitLineClamp: 1,
         [theme.breakpoints.down('lg')]: {
            fontSize: "1rem",
         },
      },
      buttonGroup: {
         // padding: theme.spacing(1.5, 6),
      },
      button: {
         borderRadius: cardBorderRadius,
         textDecoration: "none !important",
      },
   };
});

const fortyFiveMinutesAgo = new Date(
   Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS
);

const throttle_speed = 50;
const UpcomingLivestreamCard = ({
   livestream,
   handleOpenJoinModal,
   disableExpand,
   noRegister,
}) => {
   const theme = useTheme();
   const isLandscapeOnMobile = useMediaQuery(
      `${theme.breakpoints.down('md')} and (orientation: landscape)`
   );
   const [hovered, setHovered] = useState(false);
   const classes = useStyles();
   const { push, asPath } = useRouter();
   const [speakers, setSpeakers] = useState([]);
   const [groups, setGroups] = useState([]);
   const { userData, authenticatedUser } = useAuth();

   const handleMouseEnter = debounce(
      () => !disableExpand && !isLandscapeOnMobile && setHovered(true),
      throttle_speed
   );
   useEffect(() => {
      setHovered(false);
   }, [isLandscapeOnMobile]);
   const handleMouseLeave = debounce(() => setHovered(false), throttle_speed);

   const {
      getFollowingGroupsWithCache,
      deregisterFromLivestream,
   } = useFirebase();

   useEffect(() => {
      (async function () {
         if (livestream.groupIds) {
            try {
               const newGroups = await getFollowingGroupsWithCache(
                  livestream.groupIds
               );
               setGroups(
                  newGroups.map((group) => ({
                     ...group,
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
               imgPath:
                  getResizedUrl(speaker.avatar, "xs") || speakerPlaceholder,
               subLabel: `${speaker.position}`,
               id: speaker.id,
            }))
         );
      }
   }, [livestream.speakers]);

   const status = useMemo(() => {
      const hasRegistered = Boolean(
         livestream.registeredUsers?.includes(authenticatedUser.email)
      );
      let mainButtonLabel = "Join";
      let registrationDisabled = false;
      let numberOfSpotsRemaining =
         livestream.maxRegistrants -
         (livestream.registeredUsers ? livestream.registeredUsers.length : 0);
      const isPastLivestream =
         livestream.start?.toDate?.() <= fortyFiveMinutesAgo;

      if (hasRegistered) {
         mainButtonLabel = "Cancel";
      } else if (
         livestream.maxRegistrants &&
         livestream.maxRegistrants > 0 &&
         livestream.registeredUsers &&
         livestream.maxRegistrants <=
            (livestream.registeredUsers ? livestream.registeredUsers.length : 0)
      ) {
         mainButtonLabel = "full";
      } else if (authenticatedUser) {
         mainButtonLabel = "attend";
      }

      if (isPastLivestream) {
         registrationDisabled = true;
      } else if (hasRegistered) {
         registrationDisabled = false;
      } else if (livestream?.maxRegistrants && livestream?.maxRegistrants > 0) {
         registrationDisabled = livestream.registeredUsers
            ? livestream.maxRegistrants <= livestream.registeredUsers.length
            : false;
      }

      if (!livestream.maxRegistrants) {
         numberOfSpotsRemaining = 0;
      } else if (!livestream.registeredUsers) {
         numberOfSpotsRemaining = livestream.maxRegistrants;
      }

      return {
         hasRegistered,
         mainButtonLabel,
         registrationDisabled,
         numberOfSpotsRemaining,
         isPastLivestream,
      };
   }, [
      livestream.maxRegistrants,
      livestream.start,
      livestream.registeredUsers,
      authenticatedUser.email,
   ]);

   const handleRegisterClick = () => {
      if (status.hasRegistered) {
         return deregister();
      } else {
         return startRegistrationProcess();
      }
   };

   const startRegistrationProcess = async () => {
      if (
         (authenticatedUser.isLoaded && authenticatedUser.isEmpty) ||
         !authenticatedUser.emailVerified
      ) {
         return push({
            pathname: `/login`,
            query: {
               absolutePath: asPath,
            },
         });
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return push({
            pathname: "/profile",
         });
      }
      handleOpenJoinModal({ groups, livestream });
   };

   const deregister = async () => {
      try {
         if (authenticatedUser.isLoaded && authenticatedUser.isEmpty) {
            return push({
               pathname: "/login",
               query: {
                  absolutePath: asPath,
               },
            });
         }

         return await deregisterFromLivestream(
            livestream?.id,
            authenticatedUser.email
         );
      } catch (e) {}
   };

   return (
      <Paper
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         className={clsx(classes.root, {
            [classes.rootHovered]: hovered,
            [classes.rootLandscape]: isLandscapeOnMobile,
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
               [classes.contentWrapperLandscape]: isLandscapeOnMobile,
            })}
         >
            <Box
               className={clsx(classes.upperContent, {
                  [classes.upperContentHovered]: hovered,
               })}
            >
               <Avatar
                  alt="company-logo"
                  className={clsx(classes.companyLogo, {
                     [classes.companyLogoHovered]: hovered,
                  })}
                  variant="rounded"
                  imgProps={{ loading: "lazy" }}
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
                     <ButtonGroup
                        variant="text"
                        color="primary"
                        fullWidth
                        className={classes.buttonGroup}
                        aria-label="text primary button group"
                     >
                        {(!status.isPastLivestream || !livestream.openStream) &&
                           !noRegister && (
                              <Button
                                 color={
                                    status.hasRegistered ? "default" : "primary"
                                 }
                                 onClick={handleRegisterClick}
                                 size="large"
                                 disableElevation={status.hasRegistered}
                                 variant={"contained"}
                                 className={classes.button}
                              >
                                 {status.hasRegistered
                                    ? "Cancel"
                                    : status.mainButtonLabel}
                              </Button>
                           )}
                        <Button
                           color="primary"
                           size="large"
                           component={Link}
                           href={`/upcoming-livestream/${livestream.id}`}
                           variant="outlined"
                           className={classes.button}
                        >
                           {noRegister ? "Learn More" : "More"}
                        </Button>
                     </ButtonGroup>
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
                        handleOpenJoinModal={handleOpenJoinModal}
                        authenticatedUser={authenticatedUser}
                        userData={userData}
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
