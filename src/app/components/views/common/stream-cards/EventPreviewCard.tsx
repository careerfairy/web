import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AvatarGroup from "@mui/material/AvatarGroup";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import { alpha, Theme } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/CheckCircle";
import {
   getBaseUrl,
   getMaxLineStyles,
   getResizedUrl,
} from "components/helperFunctions/HelperFunctions";
import WhiteTagChip from "../chips/TagChip";
import { LiveStreamEvent } from "types/event";
import Image from "next/image";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import Avatar from "@mui/material/Avatar";
import { useRouter } from "next/router";
import Link from "components/views/common/Link";
import { chekIfPast, getRelevantHosts } from "util/StreamUtil";
import { useCopyToClipboard } from "react-use";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { useAuth } from "HOCs/AuthProvider";
import LiveIcon from "@mui/icons-material/RadioButtonChecked";
import Skeleton from "@mui/material/Skeleton";

import { Chip, useMediaQuery } from "@mui/material";
import DateAndShareDisplay from "./common/DateAndShareDisplay";
import { Interest } from "../../../../types/interests";

const logosWrapperSpacing = 12;
const styles = {
   hideOnHoverContent: {
      position: "absolute",
      inset: 0,
      "& .MuiChip-root": {
         boxShadow: 2,
      },
      padding: (theme) => theme.spacing(3),
      transition: (theme: Theme) => theme.transitions.create(["opacity"]),
      display: "flex",
      flexWrap: "nowrap",
      zIndex: 1,
      "& > *": {
         flex: 0.5,
      },
   },
   hostsWrapper: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start",
   },
   backgroundImage: {
      transition: (theme: Theme) =>
         theme.transitions.create(["transform"], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
         }),
   },
   backgroundImageLoader: {
      position: "absolute",
      inset: 0,
      height: "auto",
   },
   mainContentHoverStyles: {
      "&:hover, &:focus-within": {
         "& .hideOnHoverContent": {
            opacity: 0,
         },
         "& .backgroundImage": {
            transform: "scale(1.1)",
         },
         "& .title": (theme) => ({
            [theme.breakpoints.up("md")]: {
               ...getMaxLineStyles(3),
            },
         }),
         "& .chipsWrapper": {
            display: "none",
         },
         "& .mainContent": {
            transform: "translateY(0)",
            opacity: 1,
            "& > *:not(.titleWrapper)": {
               opacity: 1,
               transition: (theme: Theme) =>
                  theme.transitions.create(["opacity"], {
                     duration: theme.transitions.duration.standard,
                     easing: theme.transitions.easing.easeInOut,
                  }),
            },
         },
         "&:after": {
            transform: "translateY(-50%)",
         },
      },
   },
   mainAndLowerContentWrapper: {
      backgroundColor: (theme: Theme) => theme.palette.background.paper,
      borderRadius: (theme) => theme.spacing(0.2, 0.2, 1, 1),
      overflow: "hidden",
   },
   mainContentWrapper: {
      boxShadow: 3,
      position: "relative",
      height: (theme) => theme.spacing(32),
      display: "flex",
      alignItems: "flex-end",
      overflow: "hidden",
      width: "100%",
      color: "white",
      "&:before": {},

      "&:after": {
         content: "''",
         display: "block",
         position: "absolute",
         top: "0",
         left: "0",
         width: "100%",
         height: "200%",
         pointerEvents: "none",
         transition: (theme: Theme) =>
            theme.transitions.create(["transform"], {
               duration: theme.transitions.duration.standard,
            }),
         backgroundImage: (theme) =>
            `linear-gradient(0deg, ${alpha(
               theme.palette.common.black,
               0.7
            )}, ${alpha(theme.palette.common.black, 0)})`,
         transform: "translateY(0)",
      },
   },
   mainContent: {
      transform: {
         xs: "translateY(calc(100% - 10rem))",
         sm: "translateY(calc(100% - 10rem))",
      },

      "& > *:not(& .titleWrapper)": {
         opacity: 0,
      },
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      position: "absolute",
      inset: 0,
      width: "100%",
      padding: { xs: 3, sm: 3 },
      transition: (theme: Theme) =>
         `transform ${theme.transitions.duration.complex}ms cubic-bezier(0.19, 1, 0.22, 1)`,
      zIndex: 1,
   },
   titleWrapper: {},
   title: {
      fontWeight: 600,
      ...getMaxLineStyles(2),
      textShadow: (theme) => theme.darkTextShadow,
   },
   summary: {
      ...getMaxLineStyles(3),
   },
   btn: {
      flex: 0.5,
      borderRadius: 1,
   },
   bottomContentWrapper: {
      py: 1,
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "row",
      height: (theme) => theme.spacing(logosWrapperSpacing),
   },
   bottomLogoWrapper: {
      display: "grid",
      placeItems: "center",
      flex: 0.2,
   },
   bottomLogoAvatar: {
      p: 1,
      height: "-webkit-fill-available",
      width: "-webkit-fill-available",
      borderRadius: 2,
      background: "white",
      "& img": {
         maxHeight: 45,
         maxWidth: 140,
      },
   },
   interestsWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      flex: 0.8,
   },
   eventsInterest: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      "& .MuiChip-root": {
         margin: 0.5,
         // borderColor: "black",
         color: "black",
         // boxShadow: 2,
         // borderRadius: (theme) => theme.spacing(0.7),
      },
   },
   interestChip: {
      fontWeight: 500,
      fontSize: "1rem",
   },
   hostsInnerWrapper: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      flexDirection: "column",
   },
   hostedText: {
      fontWeight: 600,
      color: "white",
      textShadow: (theme) => theme.darkTextShadow,
   },
   hostAvatar: {
      padding: 1,
      backgroundColor: "white",
      width: (theme) => theme.spacing(logosWrapperSpacing * 0.6),
      boxShadow: 3,
      border: "none !important",
   },
   nextImageWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
   },
   chipLoader: {
      height: 40,
      width: 50,
      borderRadius: 4,
   },
} as const;

const EventPreviewCard = ({
   event,
   loading,
   light,
   onRegisterClick,
   registering,
   interests,
   animation,
   autoRegister,
}: EventPreviewCardProps) => {
   const mobile = useMediaQuery("(max-width:700px)");
   const { query, push, pathname } = useRouter();
   const getStartDate = () => event?.start?.toDate?.();
   const [eventInterests, setSetEventInterests] = useState([]);
   const [hasRegistered, setHasRegistered] = useState(false);
   const firebase = useFirebaseService();
   const { authenticatedUser } = useAuth();
   const [hosts, setHosts] = useState(undefined);
   const [isPast, setIsPast] = useState(chekIfPast(getStartDate()));
   const [showHosts, setShowHosts] = useState(false);
   const [_, copyToClipboard] = useCopyToClipboard();
   const dispatch = useDispatch();

   const {
      query: { groupId },
   } = useRouter();

   useEffect(() => {
      const shouldHide = Boolean(
         hosts?.length === 1 && !hosts[0]?.universityCode
      );
      setShowHosts(!shouldHide);
   }, [hosts]);

   useEffect(() => {
      if (!loading && interests) {
         setSetEventInterests([
            ...interests.filter((interest) =>
               event?.interestsIds?.includes(interest.id)
            ),
            ...interests.filter((interest) =>
               event?.interestsIds?.includes(interest.id)
            ),
            ...interests.filter((interest) =>
               event?.interestsIds?.includes(interest.id)
            ),
         ]);
      }
   }, [event?.interestsIds, loading, interests]);

   useEffect(() => {
      if (!loading) {
         setHasRegistered(
            Boolean(event?.registeredUsers?.includes(authenticatedUser?.email))
         );
      }
   }, [event?.registeredUsers, loading, authenticatedUser?.email]);

   useEffect(() => {
      if (!light && !loading) {
         (async function getHosts() {
            const newHosts = await firebase.getCareerCentersByGroupId(
               event?.groupIds || []
            );

            setHosts(
               newHosts.length
                  ? getRelevantHosts(groupId as string, event, newHosts)
                  : null
            );
         })();
      }
   }, [event?.groupIds, groupId, loading]);

   useEffect(() => {
      if (!loading) {
         setIsPast(chekIfPast(getStartDate()));
      }
   }, [event?.start, loading]);

   useEffect(() => {
      if (
         autoRegister &&
         query.register &&
         query.register === event?.id &&
         hosts?.length &&
         !event.registeredUsers.includes(authenticatedUser.email)
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
            onClickRegister();
         })();
      }
   }, [
      query.register,
      event?.id,
      hosts,
      event?.registeredUsers,
      authenticatedUser.email,
      autoRegister,
   ]);

   const handleShareClick = () => {
      const linkToEvent = event
         ? groupId
            ? `/next-livestreams/${groupId}?livestreamId=${event.id}`
            : `/next-livestreams?livestreamId=${event.id}`
         : "";
      copyToClipboard(`${getBaseUrl()}${linkToEvent}`);
      dispatch(
         actions.enqueueSnackbar({
            message: `Link to ${event?.title} has been copied!`,
            options: {
               variant: "success",
            },
         })
      );
   };

   const onClickRegister = () => {
      onRegisterClick(event, hosts[0]?.id, hosts, hasRegistered);
   };

   return (
      <>
         <Box>
            <DateAndShareDisplay
               startDate={getStartDate()}
               loading={loading}
               onShareClick={handleShareClick}
            />
            <Box
               sx={[
                  styles.mainAndLowerContentWrapper,
                  light && { borderRadius: 0 },
               ]}
            >
               <Box
                  sx={[
                     styles.mainContentWrapper,
                     !loading && styles.mainContentHoverStyles,
                  ]}
               >
                  {loading ? (
                     <Skeleton
                        animation={animation ?? "wave"}
                        variant="rectangular"
                        sx={styles.backgroundImageLoader}
                     />
                  ) : (
                     <Box
                        alt="Illustration"
                        src={getResizedUrl(event?.backgroundImageUrl, "lg")}
                        layout="fill"
                        className="backgroundImage"
                        sx={styles.backgroundImage}
                        component={Image}
                        priority
                        objectFit="cover"
                     />
                  )}
                  <Box
                     className="hideOnHoverContent"
                     sx={[styles.hideOnHoverContent]}
                  >
                     <Stack direction={"row"} spacing={2}>
                        {loading ? (
                           <>
                              <Skeleton
                                 animation={animation}
                                 sx={styles.chipLoader}
                              />
                           </>
                        ) : (
                           <>
                              {event?.hasStarted && !isPast && (
                                 <Chip
                                    icon={<LiveIcon />}
                                    color="error"
                                    label={"LIVE"}
                                 />
                              )}
                              {hasRegistered && (
                                 <Chip
                                    icon={<CheckIcon />}
                                    color="primary"
                                    label={"Booked!"}
                                 />
                              )}
                           </>
                        )}
                     </Stack>
                     <Box sx={styles.hostsWrapper}>
                        {!loading && hosts && showHosts && (
                           <Box sx={styles.hostsInnerWrapper}>
                              <Box>
                                 <Typography
                                    sx={styles.hostedText}
                                    color="text.secondary"
                                 >
                                    HOSTED BY
                                 </Typography>
                                 <AvatarGroup
                                    sx={{ width: "fit-content" }}
                                    variant="rounded"
                                    max={2}
                                 >
                                    {hosts.map((host) => (
                                       <Avatar
                                          key={host.id}
                                          title={`${host.universityName}`}
                                          sx={styles.hostAvatar}
                                       >
                                          <Box sx={styles.nextImageWrapper}>
                                             <Image
                                                src={getResizedUrl(
                                                   host.logoUrl,
                                                   "lg"
                                                )}
                                                layout="fill"
                                                quality={100}
                                                objectFit="contain"
                                             />
                                          </Box>
                                       </Avatar>
                                    ))}
                                 </AvatarGroup>
                              </Box>
                           </Box>
                        )}
                     </Box>
                  </Box>
                  <Stack
                     spacing={2}
                     className="mainContent"
                     sx={styles.mainContent}
                  >
                     <Box sx={styles.titleWrapper} className="titleWrapper">
                        <Typography
                           variant={"h6"}
                           component="div"
                           className="title"
                           sx={styles.title}
                        >
                           {loading ? (
                              <Skeleton animation={animation} />
                           ) : (
                              event?.title
                           )}
                        </Typography>
                        <Stack
                           alignItems={"center"}
                           flexWrap="wrap"
                           sx={{ mt: 1 }}
                           direction={"row"}
                           spacing={1}
                           className="chipsWrapper"
                        >
                           {loading ? (
                              <Skeleton
                                 animation={animation}
                                 sx={styles.chipLoader}
                              />
                           ) : (
                              <>
                                 {event?.language?.code && (
                                    <WhiteTagChip
                                       icon={<LanguageIcon />}
                                       variant="filled"
                                       tooltipText={`This event is in ${event?.language.name}`}
                                       label={event?.language.code.toUpperCase()}
                                    />
                                 )}
                              </>
                           )}
                        </Stack>
                     </Box>
                     {loading ? (
                        <Box sx={{ height: 50 }} />
                     ) : (
                        <>
                           <Typography sx={styles.summary}>
                              {event?.summary}
                           </Typography>
                           <Stack spacing={1} direction="row">
                              {onRegisterClick && (
                                 <Button
                                    sx={styles.btn}
                                    onClick={onClickRegister}
                                    variant={
                                       hasRegistered ? "outlined" : "contained"
                                    }
                                    color={hasRegistered ? "info" : "primary"}
                                    disabled={registering}
                                    size={"medium"}
                                 >
                                    {hasRegistered
                                       ? "cancel"
                                       : mobile
                                       ? "attend"
                                       : "I'll attend"}
                                 </Button>
                              )}

                              <Button
                                 sx={styles.btn}
                                 component={Link}
                                 /*
                                 // @ts-ignore */
                                 href={{
                                    pathname: `/upcoming-livestream/${event?.id}`,
                                    hash: isPast && "#about",
                                    query: {
                                       ...(event?.groupIds?.includes(
                                          groupId as string
                                       ) && { groupId }),
                                    },
                                 }}
                                 variant={"contained"}
                                 color={"secondary"}
                                 size={"small"}
                              >
                                 {mobile ? "details" : "see details"}
                              </Button>
                           </Stack>
                        </>
                     )}
                  </Stack>
               </Box>
               {!light && (
                  <Box sx={styles.bottomContentWrapper}>
                     <Box sx={styles.bottomLogoWrapper}>
                        <CardMedia
                           sx={styles.bottomLogoAvatar}
                           title={event?.company}
                        >
                           {loading ? (
                              <Skeleton
                                 animation={animation ?? "wave"}
                                 variant="rectangular"
                                 sx={{ borderRadius: 2 }}
                                 width={100}
                                 height={"100%"}
                              />
                           ) : (
                              <div
                                 style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "100%",
                                 }}
                              >
                                 <Image
                                    src={getResizedUrl(
                                       event?.companyLogoUrl,
                                       "lg"
                                    )}
                                    layout="fill"
                                    objectFit="contain"
                                    quality={100}
                                 />
                              </div>
                           )}
                        </CardMedia>
                     </Box>
                     <Box sx={styles.interestsWrapper}>
                        <Box sx={styles.eventsInterest}>
                           {loading ? (
                              <Skeleton
                                 animation={animation}
                                 width={90}
                                 height={40}
                                 sx={styles.interestChip}
                              />
                           ) : (
                              <>
                                 {!loading && !eventInterests.length && (
                                    <Chip
                                       sx={styles.interestChip}
                                       variant={"outlined"}
                                       label={"For all users"}
                                       size={mobile ? "small" : "medium"}
                                    />
                                 )}
                                 {eventInterests.slice(0, 2).map((interest) => (
                                    <Chip
                                       sx={styles.interestChip}
                                       key={interest.id}
                                       variant={"outlined"}
                                       size={mobile ? "small" : "medium"}
                                       label={interest.name}
                                    />
                                 ))}
                                 {eventInterests.length > 3 && (
                                    <Chip
                                       sx={styles.interestChip}
                                       size={mobile ? "small" : "medium"}
                                       variant={"outlined"}
                                       label={`+ ${
                                          eventInterests.length - 3
                                       } more`}
                                    />
                                 )}
                              </>
                           )}
                        </Box>
                     </Box>
                  </Box>
               )}
            </Box>
         </Box>
      </>
   );
};

interface EventPreviewCardProps {
   event?: LiveStreamEvent;
   loading?: boolean;
   light?: boolean;
   registering?: boolean;
   autoRegister?: boolean;
   interests?: Interest[];
   onRegisterClick?: (
      event: LiveStreamEvent,
      targetGroupId: string,
      groups: any[],
      hasRegistered: boolean
   ) => any;
   // Animate the loading animation, defaults to the "wave" prop
   animation?: false | "wave" | "pulse";
}
export default EventPreviewCard;
