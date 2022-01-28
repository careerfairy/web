import PropTypes from "prop-types";
import React, { Fragment, memo, useEffect, useMemo, useState } from "react";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import { alpha, makeStyles } from "@material-ui/core/styles";
import UserUtil from "../../../../../data/util/UserUtil";
import { useRouter } from "next/router";
import GroupsUtil from "../../../../../data/util/GroupsUtil";
import {
   dynamicSort,
   getResizedUrl,
   getResponsiveResizedUrl,
} from "../../../../helperFunctions/HelperFunctions";
import {
   Card,
   CardHeader,
   ClickAwayListener,
   Collapse,
   Grow,
} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import { Item, Row } from "@mui-treasury/components/flex";
import { Info, InfoSubtitle, InfoTitle } from "@mui-treasury/components/info";
import { useNewsInfoStyles } from "@mui-treasury/styles/info/news";
import { useCoverCardMediaStyles } from "@mui-treasury/styles/cardMedia/cover";
import { AvatarGroup } from "@material-ui/lab";
import { speakerPlaceholder } from "../../../../util/constants";
import Tag from "./Tag";
import Fade from "@stahl.luke/react-reveal/Fade";
import clsx from "clsx";
import CopyToClipboard from "../../../common/CopyToClipboard";
import { DateTimeDisplay } from "./TimeDisplay";
import { AttendButton, DetailsButton } from "./actionButtons";
import LogoElement from "../LogoElement";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import { InPersonEventBadge, LimitedRegistrationsBadge } from "./badges";
import RegistrationModal from "../../../common/registration-modal";

const useStyles = makeStyles((theme) => ({
   cardHovered: {
      height: "fit-content",
      transform: "translateY(-2px)",
      "& $shadow": {
         bottom: "-1.5rem",
      },
      "& $shadow2": {
         bottom: "-2.5rem",
      },
   },
   card: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      width: "-webkit-fill-available",
      justifyContent: "space-between",
      position: "relative",
      overflow: "visible",
      borderRadius: "1.5rem",
      transition: "0.4s",
      "&:before": {
         content: '""',
         position: "absolute",
         zIndex: 0,
         display: "block",
         width: "100%",
         bottom: -1,
         height: "100%",
         borderRadius: "1.5rem",
         backgroundColor: "rgba(0,0,0,0.08)",
      },
   },
   main: {
      display: "flex",
      flex: 1,
      minHeight: 406,
      overflow: "hidden",
      borderTopLeftRadius: "1.5rem",
      borderTopRightRadius: "1.5rem",
      zIndex: 1,
      "&:after": {
         content: '""',
         position: "absolute",
         bottom: 0,
         display: "block",
         width: "100%",
         height: "100%",
         background: `linear-gradient(to top, ${theme.palette.navyBlue.main}, rgba(0,0,0,0))`,
      },
   },
   mainBooked: {
      "&:after": {
         background: theme.palette.primary.dark,
         opacity: 0.8,
      },
   },
   highlighted: {
      border: `12px solid ${theme.palette.primary.main}`,
   },
   content: {
      bottom: 0,
      width: "100%",
      zIndex: 1,
      padding: theme.spacing(2, 2, 2),
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
   },
   avatar: {
      width: 48,
      height: 48,
   },
   groupLogo: {
      width: 75,
      height: 75,
      background: theme.palette.common.white,
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   groupLogoStacked: {
      width: 60,
      height: 60,
   },
   title: {
      fontWeight: 800,
      color: theme.palette.common.white,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: "3",
      fontSize: "1.5rem",
      WebkitBoxOrient: "vertical",
   },
   titleHovered: {
      WebkitLineClamp: "inherit",
   },
   author: {
      zIndex: 1,
      position: "relative",
      borderBottomLeftRadius: "1.5rem",
      borderBottomRightRadius: "1.5rem",
      display: "flex",
      flexDirection: "column",
   },
   authorHovered: {
      boxShadow: theme.shadows[3],
   },
   shadow: {
      transition: "0.2s",
      position: "absolute",
      zIndex: 0,
      width: "88%",
      height: "100%",
      bottom: 0,
      borderRadius: "1.5rem",
      backgroundColor: "rgba(0,0,0,0.06)",
      left: "50%",
      transform: "translateX(-50%)",
   },
   shadow2: {
      bottom: 0,
      width: "72%",
      backgroundColor: "rgba(0,0,0,0.04)",
   },
   previewRow: {
      width: "100%",
      justifyContent: "space-evenly",
   },
   avaLogoWrapper: {
      display: "flex",
      // flexDirection: "column",
      justifyContent: "center",
      flexWrap: "inherit",
      alignItems: "center",
   },
   avaLogoWrapperHovered: {
      flexWrap: "wrap",
      maxHeight: 300,
      overflow: "auto",
   },
   top: {
      zIndex: 995,
   },
   groupLogos: {
      justifyContent: "space-evenly",
      display: "flex",
      flexWrap: "wrap",
   },
   livestreamCompanyAva: {
      borderBottomRightRadius: `${theme.spacing(2.5)}px !important`,
      borderTopLeftRadius: `${theme.spacing(2.5)}px !important`,
      width: "100%",
      height: 100,
      boxShadow: theme.shadows[5],
      background: theme.palette.common.white,
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   pulseAnimate: {
      animation: `$pulse 1.2s infinite`,
   },
   "@keyframes pulse": {
      "0%": {
         MozBoxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 1)}`,
         boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 1)}`,
      },
      "70%": {
         MozBoxShadow: `0 0 0 15px ${alpha(theme.palette.primary.main, 0)}`,
         boxShadow: `0 0 0 15px ${alpha(theme.palette.primary.main, 0)}`,
      },
      "100%": {
         MozBoxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
         boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
      },
   },
   bookedIcon: {
      color: "white",
      position: "absolute",
      left: theme.spacing(1),
      top: 5,
      display: "flex",
      alignItems: "center",
   },
   bookedText: {
      marginLeft: theme.spacing(1),
      fontWeight: "bold",
      color: theme.palette.common.white,
   },
}));

const maxOptions = 2;
const GroupStreamCardV2 = memo(
   ({
      livestream,
      user,
      mobile,
      userData,
      livestreamId,
      id,
      careerCenterId,
      groupData,
      listenToUpcoming,
      isTargetDraft,
      isPastLivestreams,
      globalCardHighlighted,
      isAdmin,
   }) => {
      const firebase = useFirebaseService();
      const mediaStyles = useCoverCardMediaStyles();
      const classes = useStyles();
      const { absolutePath, pathname, push, query } = useRouter();
      const linkToStream = useMemo(() => {
         const notLoggedIn =
            (user.isLoaded && user.isEmpty) || !user.emailVerified;
         const registerQuery = notLoggedIn ? `&register=${livestream.id}` : "";
         const referrerQuery = query.referrerId
            ? `&referrerId=${query.referrerId}`
            : "";
         const queries = `${registerQuery}${referrerQuery}`;
         return pathname === "/next-livestreams/[groupId]"
            ? `/next-livestreams/${groupData.groupId}?livestreamId=${livestream.id}${queries}`
            : `/next-livestreams?livestreamId=${livestream.id}${queries}`;
      }, [
         pathname,
         livestream?.id,
         groupData?.groupId,
         query.referrerId,
         user,
      ]);

      function userIsRegistered() {
         if (
            (user.isLoaded && user.isEmpty) ||
            !livestream.registeredUsers ||
            isAdmin
         ) {
            return false;
         }
         return Boolean(livestream.registeredUsers?.indexOf(user.email) > -1);
      }

      const registered = useMemo(() => userIsRegistered(), [
         livestream.registeredUsers,
      ]);

      const [cardHovered, setCardHovered] = useState(false);
      const [targetOptions, setTargetOptions] = useState([]);
      const [filteredGroups, setFilteredGroups] = useState([]);
      const [unfilteredGroups, setUnfilteredGroups] = useState([]);
      const [isHighlighted, setIsHighlighted] = useState(false);
      const [targetGroupId, setTargetGroupId] = useState("");
      const [joinGroupModalData, setJoinGroupModalData] = useState(undefined);
      const handleCloseJoinModal = () => setJoinGroupModalData(undefined);
      const handleOpenJoinModal = (dataObj) =>
         setJoinGroupModalData({
            groups: dataObj.groups,
            targetGroupId: targetGroupId,
            livestream: dataObj?.livestream,
         });
      useEffect(() => {
         if (checkIfHighlighted() && !isHighlighted) {
            setIsHighlighted(true);
         } else if (checkIfHighlighted() && isHighlighted) {
            setIsHighlighted(false);
         }
      }, [livestreamId, id, careerCenterId, groupData.groupId]);

      useEffect(() => {
         if (
            query.register === livestream.id &&
            unfilteredGroups.length &&
            !livestream.registeredUsers.includes(user.email)
         ) {
            (async function handleAutoRegister() {
               const newQuery = { ...query };
               if (newQuery.register) {
                  delete newQuery.register;
               }
               await push({
                  pathname: pathname,
                  query: {
                     ...newQuery,
                  },
               });
               handleOpenJoinModal({ groups: unfilteredGroups, livestream });
            })();
         }
      }, [
         query.register,
         livestream.id,
         unfilteredGroups,
         livestream.registeredUsers,
         user.email,
      ]);

      useEffect(() => {
         if (groupData.categories && livestream.targetCategories) {
            const { groupId, categories } = groupData;
            let totalOptions = [];
            categories.forEach((category) =>
               totalOptions.push(category.options)
            );
            const flattenedOptions = totalOptions.reduce(function (a, b) {
               return a.concat(b);
            }, []);
            const matchedOptions = livestream.targetCategories[groupId];
            if (matchedOptions) {
               const filteredOptions = flattenedOptions
                  .filter((option) => matchedOptions.includes(option.id))
                  .sort(dynamicSort("name"))
                  .reverse();
               setTargetOptions(filteredOptions);
            }
         }
      }, [groupData, livestream]);

      useEffect(() => {
         if (
            !filteredGroups.length &&
            livestream &&
            livestream.groupIds &&
            livestream.groupIds.length
         ) {
            firebase
               .getDetailLivestreamCareerCenters(livestream.groupIds)
               .then((querySnapshot) => {
                  const groupList = querySnapshot.docs.map((doc) => ({
                     id: doc.id,
                     ...doc.data(),
                  }));

                  let targetGroupId = groupData?.groupId;
                  if (listenToUpcoming) {
                     const companyThatPublishedStream = groupList.find(
                        (group) =>
                           !group.universityCode &&
                           group.id === livestream?.author?.groupId
                     );
                     if (companyThatPublishedStream?.id) {
                        targetGroupId = companyThatPublishedStream.id;
                     }
                  }
                  const targetGroup = groupList.find(
                     (group) => group.id === targetGroupId
                  );
                  if (targetGroup) {
                     setTargetGroupId(targetGroup.id);
                  }
                  setFilteredGroups(targetGroup ? [targetGroup] : groupList);
                  setUnfilteredGroups(groupList);
               })
               .catch((e) => {
                  console.log("error", e);
               });
         }
      }, [groupData?.groupId, listenToUpcoming, livestream?.author?.groupId]);

      const handleMouseEntered = () => {
         if (!cardHovered && !globalCardHighlighted) {
            setCardHovered(true);
         }
      };

      const handleMouseLeft = () => {
         if (isHighlighted) {
            // setGlobalCardHighlighted?.(false)
         }
         cardHovered && setCardHovered(false);
      };

      const checkIfHighlighted = () => {
         if (isTargetDraft) return true;
         if (
            careerCenterId &&
            livestreamId &&
            id &&
            livestreamId === id &&
            groupData.groupId === careerCenterId
         ) {
            return true;
         } else return livestreamId && !careerCenterId && livestreamId === id;
      };

      const checkIfUserFollows = (careerCenter) => {
         if (user.isLoaded && !user.isEmpty && userData && userData.groupIds) {
            const { groupId } = careerCenter;
            return userData.groupIds.includes(groupId);
         } else {
            return false;
         }
      };

      function deregisterFromLivestream() {
         if (user.isLoaded && user.isEmpty) {
            return push({
               pathname: "/login",
               query: {
                  absolutePath: absolutePath,
               },
            });
         }

         firebase.deregisterFromLivestream(livestream.id, user.email);
      }

      async function startRegistrationProcess() {
         if ((user.isLoaded && user.isEmpty) || !user.emailVerified) {
            return push({
               pathname: `/login`,
               query: {
                  absolutePath: linkToStream,
               },
            });
         }

         if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            return push({
               pathname: "/profile",
            });
         }

         setCardHovered(false);

         handleOpenJoinModal({
            groups: unfilteredGroups,
            livestream,
         });
      }

      const handleRegisterClick = () => {
         if (user && livestream.registeredUsers?.indexOf(user.email) > -1) {
            deregisterFromLivestream();
         } else {
            startRegistrationProcess();
         }
      };

      const checkIfRegistered = () => {
         return Boolean(livestream.registeredUsers?.indexOf(user.email) > -1);
      };

      const handleCardClick = () => {
         if (mobile) {
            setCardHovered(true);
         }
      };

      const handleClickAwayDetails = () => {
         if (mobile) {
            setCardHovered(false);
         }
      };

      const registrationDisabled = useMemo(() => {
         if (isPastLivestreams) return true;
         //User should always be able to cancel registration
         if (userIsRegistered()) return false;
         //Disable registration if max number of registrants is reached
         if (livestream.maxRegistrants && livestream.maxRegistrants > 0) {
            return livestream.registeredUsers
               ? livestream.maxRegistrants <= livestream.registeredUsers.length
               : false;
         }
         return false;
      }, [isPastLivestreams, livestream, user, registered]);

      const mainButtonLabel = useMemo(() => {
         if (userIsRegistered()) return "Cancel";
         if (
            livestream.maxRegistrants &&
            livestream.maxRegistrants > 0 &&
            livestream.registeredUsers &&
            livestream.maxRegistrants <= livestream.registeredUsers.length
         ) {
            return "No spots left";
         } else if (user) {
            return "I'll attend";
         } else {
            return "Join to attend";
         }
      }, [user, registered, livestream]);

      const numberOfSpotsRemaining = useMemo(() => {
         if (!livestream.maxRegistrants) return 0;
         else if (!livestream.registeredUsers) return livestream.maxRegistrants;
         else {
            return (
               livestream.maxRegistrants - livestream.registeredUsers.length
            );
         }
      }, [livestream?.maxRegistrants, livestream.registeredUsers?.length]);

      return (
         <Fragment>
            <ClickAwayListener onClickAway={handleClickAwayDetails}>
               <Card
                  onClick={handleCardClick}
                  onMouseEnter={handleMouseEntered}
                  onMouseLeave={handleMouseLeft}
                  className={clsx(classes.card, {
                     [classes.top]: cardHovered,
                     [classes.cardHovered]: cardHovered,
                     [classes.pulseAnimate]: isHighlighted,
                  })}
               >
                  {livestream.isFaceToFace && (
                     <Box position="absolute" top={5} right={5} zIndex={200}>
                        <InPersonEventBadge />
                     </Box>
                  )}
                  {livestream.maxRegistrants && (
                     <Box position="absolute" top={5} left={5} zIndex={200}>
                        <LimitedRegistrationsBadge
                           numberOfSpotsRemaining={numberOfSpotsRemaining}
                        />
                     </Box>
                  )}
                  <Box
                     className={clsx(classes.main, {
                        [classes.mainBooked]: registered,
                        [classes.highlighted]: livestream.highlighted,
                     })}
                     position={"relative"}
                  >
                     <CardMedia
                        classes={mediaStyles}
                        image={getResponsiveResizedUrl(
                           livestream.backgroundImageUrl,
                           mobile,
                           "sm",
                           "md"
                        )}
                     />
                     <div className={classes.content}>
                        <CardHeader
                           avatar={
                              <DateTimeDisplay
                                 mobile={mobile}
                                 date={livestream.start?.toDate()}
                              />
                           }
                           title={
                              <Avatar
                                 variant="rounded"
                                 className={classes.livestreamCompanyAva}
                                 src={getResizedUrl(livestream.companyLogoUrl)}
                                 alt={livestream.company}
                              />
                           }
                           action={
                              <CopyToClipboard
                                 color="white"
                                 value={linkToStream}
                              />
                           }
                        />
                        <Collapse collapsedSize={80} in={cardHovered}>
                           <Typography
                              variant={"h4"}
                              className={clsx(classes.title, {
                                 [classes.titleHovered]: cardHovered,
                              })}
                           >
                              {livestream.title}
                           </Typography>
                        </Collapse>
                        <Box
                           style={{
                              maxHeight: 165,
                              overflow: "auto",
                              overflowX: "hidden",
                           }}
                        >
                           {targetOptions
                              .slice(0, cardHovered ? -1 : maxOptions)
                              .map((option) => (
                                 <Tag key={option.id} option={option} />
                              ))}
                           {targetOptions.length > maxOptions &&
                              !cardHovered && (
                                 <Tag option={{ id: "hasMore", name: "..." }} />
                              )}
                        </Box>
                        <Box marginTop={1}>
                           <DetailsButton
                              size="small"
                              mobile={mobile}
                              referrerId={query.referrerId}
                              groupData={groupData}
                              isPastLivestreams={isPastLivestreams}
                              listenToUpcoming={listenToUpcoming}
                              livestream={livestream}
                           />

                           {!isPastLivestreams && !livestream.openStream && (
                              <AttendButton
                                 size="small"
                                 mobile={mobile}
                                 disabled={registrationDisabled}
                                 attendButtonLabel={mainButtonLabel}
                                 handleRegisterClick={handleRegisterClick}
                                 checkIfRegistered={checkIfRegistered}
                                 user={user}
                              />
                           )}
                           <Grow in={Boolean(userIsRegistered())}>
                              <div className={classes.bookedIcon}>
                                 <CheckCircleRoundedIcon />
                                 <Typography
                                    variant="h6"
                                    className={classes.bookedText}
                                 >
                                    Booked
                                 </Typography>
                              </div>
                           </Grow>
                        </Box>
                     </div>
                  </Box>
                  <Row
                     className={clsx(classes.author, {
                        [classes.authorHovered]: cardHovered,
                     })}
                     m={0}
                     p={1}
                     py={1}
                     gap={mobile ? 1 : 2}
                     bgcolor={"common.white"}
                  >
                     <Collapse unmountOnExit in={!cardHovered}>
                        <Fade timeout={300} unmountOnExit in={!cardHovered}>
                           <Row
                              style={{ justifyContent: "space-evenly" }}
                              className={classes.avaLogoWrapper}
                           >
                              <Item>
                                 <AvatarGroup>
                                    {livestream.speakers?.map((speaker) => (
                                       <Avatar
                                          key={speaker.id}
                                          className={classes.avatar}
                                          src={
                                             getResizedUrl(
                                                speaker.avatar,
                                                "xs"
                                             ) || speakerPlaceholder
                                          }
                                          alt={speaker.firstName}
                                       />
                                    ))}
                                 </AvatarGroup>
                              </Item>
                              <Item>
                                 <AvatarGroup>
                                    {filteredGroups.map((careerCenter) => (
                                       <Avatar
                                          variant="rounded"
                                          key={careerCenter.id}
                                          className={clsx(
                                             classes.groupLogo,
                                             classes.groupLogoStacked
                                          )}
                                          src={getResizedUrl(
                                             careerCenter.logoUrl,
                                             "xs"
                                          )}
                                          alt={careerCenter.universityName}
                                       />
                                    ))}
                                 </AvatarGroup>
                              </Item>
                           </Row>
                        </Fade>
                     </Collapse>
                     <Collapse unmountOnExit in={cardHovered}>
                        <div
                           className={clsx(classes.avaLogoWrapper, {
                              [classes.avaLogoWrapperHovered]: cardHovered,
                           })}
                        >
                           {livestream.speakers?.map((speaker) => (
                              <Row
                                 className={classes.previewRow}
                                 key={speaker.id}
                              >
                                 <Item>
                                    <Avatar
                                       className={classes.avatar}
                                       src={
                                          getResizedUrl(speaker.avatar, "xs") ||
                                          speakerPlaceholder
                                       }
                                       alt={speaker.firstName}
                                    />
                                 </Item>
                                 <Info
                                    style={{ marginRight: "auto" }}
                                    useStyles={useNewsInfoStyles}
                                 >
                                    <InfoTitle>{`${speaker.firstName} ${speaker.lastName}`}</InfoTitle>
                                    <InfoSubtitle>
                                       {speaker.position}
                                    </InfoSubtitle>
                                 </Info>
                              </Row>
                           ))}
                           <Row
                              p={1}
                              style={{ width: "100%" }}
                              className={classes.groupLogos}
                           >
                              {filteredGroups.map((careerCenter) => (
                                 <LogoElement
                                    className={classes.groupLogo}
                                    hideFollow={
                                       (!cardHovered && !mobile) || isAdmin
                                    }
                                    handleOpenJoinModal={handleOpenJoinModal}
                                    handleCloseJoinModal={handleCloseJoinModal}
                                    key={careerCenter.groupId}
                                    livestreamId={livestream.id}
                                    userFollows={checkIfUserFollows(
                                       careerCenter
                                    )}
                                    careerCenter={careerCenter}
                                    userData={userData}
                                    user={user}
                                 />
                              ))}
                           </Row>
                        </div>
                     </Collapse>
                  </Row>
                  <div className={classes.shadow} />
                  <div className={`${classes.shadow} ${classes.shadow2}`} />
               </Card>
            </ClickAwayListener>
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               onFinish={handleCloseJoinModal}
               promptOtherEventsOnFinal={!query.groupId}
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
               targetGroupId={joinGroupModalData?.targetGroupId}
               handleClose={
                  joinGroupModalData?.livestream
                     ? undefined
                     : handleCloseJoinModal
               }
            />
         </Fragment>
      );
   }
);

GroupStreamCardV2.propTypes = {
   careerCenterId: PropTypes.string,
   firebase: PropTypes.object,
   globalCardHighlighted: PropTypes.bool,
   groupData: PropTypes.object,
   id: PropTypes.string,
   isAdmin: PropTypes.bool,
   isTargetDraft: PropTypes.bool,
   listenToUpcoming: PropTypes.bool,
   livestream: PropTypes.object.isRequired,
   livestreamId: PropTypes.string,
   mobile: PropTypes.bool,
   setGlobalCardHighlighted: PropTypes.func,
   user: PropTypes.object,
   userData: PropTypes.object,
   isPastLivestreams: PropTypes.bool,
};

export default GroupStreamCardV2;
