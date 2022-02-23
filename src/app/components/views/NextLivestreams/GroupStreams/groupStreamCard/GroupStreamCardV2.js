import PropTypes from "prop-types";
import React, { Fragment, memo, useEffect, useMemo, useState } from "react";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import UserUtil from "../../../../../data/util/UserUtil";
import { useRouter } from "next/router";
import {
   dynamicSort,
   getResizedUrl,
   getResponsiveResizedUrl,
} from "../../../../helperFunctions/HelperFunctions";
import {
   AvatarGroup,
   Card,
   CardHeader,
   ClickAwayListener,
   Collapse,
   Grow,
   Stack,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { speakerPlaceholder } from "../../../../util/constants";
import Tag from "./Tag";
import Fade from "@stahl.luke/react-reveal/Fade";
import CopyToClipboard from "../../../common/CopyToClipboard";
import { DateTimeDisplay } from "./TimeDisplay";
import { AttendButton, DetailsButton } from "./actionButtons";
import LogoElement from "../LogoElement";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { InPersonEventBadge, LimitedRegistrationsBadge } from "./badges";
import RegistrationModal from "../../../common/registration-modal";
import styles from "./GroupStreamCardV2Styles";

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

      const registered = useMemo(
         () => userIsRegistered(),
         [livestream.registeredUsers]
      );

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
                  sx={[
                     styles.card,
                     cardHovered && styles.top,
                     cardHovered && styles.cardHovered,
                     isHighlighted && styles.pulseAnimate,
                  ]}
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
                     sx={[
                        styles.main,
                        registered && styles.mainBooked,
                        livestream.highlighted && styles.highlighted,
                     ]}
                     position={"relative"}
                  >
                     <CardMedia
                        sx={{
                           top: 0,
                           left: 0,
                           width: "100%",
                           height: "100%",
                           zIndex: 0,
                           position: "absolute",
                           backgroundPosition: "center center",
                           backgroundColor: "rgba(0, 0, 0, 0.08)",
                        }}
                        image={getResponsiveResizedUrl(
                           livestream.backgroundImageUrl,
                           mobile,
                           "sm",
                           "md"
                        )}
                     />
                     <Box sx={styles.content}>
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
                                 sx={styles.livestreamCompanyAva}
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
                              sx={[
                                 styles.title,
                                 cardHovered && styles.titleHovered,
                              ]}
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

                           {!isPastLivestreams && (
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
                              <Box sx={styles.bookedIcon}>
                                 <CheckCircleRoundedIcon />
                                 <Typography
                                    variant="h6"
                                    sx={styles.bookedText}
                                 >
                                    Booked
                                 </Typography>
                              </Box>
                           </Grow>
                        </Box>
                     </Box>
                  </Box>
                  <Box
                     sx={[styles.author, cardHovered && styles.authorHovered]}
                  >
                     <Collapse sx={{ width: "100%" }} in={!cardHovered}>
                        <Fade timeout={300} unmountOnExit in={!cardHovered}>
                           <Stack
                              direction="row"
                              justifyContent="space-evenly"
                              alignItems="center"
                              sx={styles.avaLogoWrapper}
                           >
                              <Box>
                                 <AvatarGroup max={4}>
                                    {livestream.speakers?.map((speaker) => (
                                       <Avatar
                                          key={speaker.id}
                                          sx={styles.avatar}
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
                              </Box>
                              <Box>
                                 <AvatarGroup max={4}>
                                    {filteredGroups.map((careerCenter) => (
                                       <Avatar
                                          variant="rounded"
                                          key={careerCenter.id}
                                          sx={[
                                             styles.groupLogo,
                                             styles.groupLogoStacked,
                                          ]}
                                          src={getResizedUrl(
                                             careerCenter.logoUrl,
                                             "xs"
                                          )}
                                          alt={careerCenter.universityName}
                                       />
                                    ))}
                                 </AvatarGroup>
                              </Box>
                           </Stack>
                        </Fade>
                     </Collapse>
                     <Collapse
                        sx={{ width: "100%" }}
                        unmountOnExit
                        in={cardHovered}
                     >
                        <Box
                           sx={[
                              styles.avaLogoWrapper,
                              styles.avaLogoWrapperHovered,
                           ]}
                        >
                           {livestream.speakers?.map((speaker) => (
                              <Stack
                                 direction="row"
                                 justifyContent="flex-start"
                                 sx={styles.previewRow}
                                 key={speaker.id}
                              >
                                 <Box>
                                    <Avatar
                                       sx={styles.avatar}
                                       src={
                                          getResizedUrl(speaker.avatar, "xs") ||
                                          speakerPlaceholder
                                       }
                                       alt={speaker.firstName}
                                    />
                                 </Box>
                                 <Box
                                    sx={{
                                       display: "flex",
                                       flexDirection: "column",
                                       ml: 1,
                                       justifyContent: "center",
                                    }}
                                 >
                                    <Typography>
                                       {`${speaker.firstName} ${speaker.lastName}`}
                                    </Typography>
                                    <Typography
                                       variant="body2"
                                       color="textSecondary"
                                    >
                                       {speaker.position}
                                    </Typography>
                                 </Box>
                              </Stack>
                           ))}
                           <Stack
                              direction="row"
                              style={{ width: "100%" }}
                              sx={styles.groupLogos}
                           >
                              {filteredGroups.map((careerCenter) => (
                                 <LogoElement
                                    sx={styles.groupLogo}
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
                           </Stack>
                        </Box>
                     </Collapse>
                  </Box>
                  <Box sx={styles.shadow} />
                  <Box sx={[styles.shadow, styles.shadow2]} />
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
