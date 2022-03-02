import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ShareIcon from "@mui/icons-material/Share";
import DateUtil from "../../../../util/DateUtil";
import { AvatarGroup, Button, CardMedia, IconButton } from "@mui/material";
import { alpha, Theme } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import { getMaxLineStyles } from "../../../helperFunctions/HelperFunctions";
import WhiteTagChip from "../chips/TagChip";
import { existingDummyInterests } from "../../events/dummyData";
import { LiveStreamEvent } from "types/event";
import Image from "next/image";
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext";
import Avatar from "@mui/material/Avatar";

const logosWrapperSpacing = 12;
const styles = {
   root: {},
   dateShareWrapper: {
      p: 1,
   },
   date: {
      fontWeight: 600,
   },
   mainContentHoverStyles: {
      "&:hover, &:focus-within": {
         "&:before": {
            transform: "scale(1.1)",
         },
         "& .title": {
            ...getMaxLineStyles(3),
         },
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
   mainContentWrapper: {
      position: "relative",
      height: (theme) => theme.spacing(32),
      display: "flex",
      alignItems: "flex-end",
      overflow: "hidden",
      width: "100%",
      color: "white",
      boxShadow: 5,
      "&:before": {
         backgroundSize: "cover",
         content: "''",
         position: "absolute",
         inset: 0,
         transition: (theme: Theme) =>
            theme.transitions.create(["transform"], {
               duration: theme.transitions.duration.standard,
               easing: theme.transitions.easing.easeInOut,
            }),
      },

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
         xs: "translateY(calc(100% - 9rem))",
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
      padding: { xs: 2, sm: 3 },
      transition: (theme: Theme) =>
         `transform ${theme.transitions.duration.complex}ms cubic-bezier(0.19, 1, 0.22, 1)`,
      zIndex: 1,
   },
   titleWrapper: {},
   title: {
      fontWeight: 600,
      ...getMaxLineStyles(2),
   },
   summary: {
      ...getMaxLineStyles(3),
   },
   btn: {
      flex: 0.5,
      borderRadius: 0.3,
   },
   logosWrapper: {
      py: 1,
      display: "flex",
      justifyContent: "space-between",
      height: (theme) => theme.spacing(logosWrapperSpacing),
      "& > *": {
         flex: 0.5,
      },
   },
   hostsWrapper: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      flexDirection: "column",
   },
   hostedText: {
      fontWeight: 600,
   },
   hostAvatar: {
      padding: 1,
      backgroundColor: "white",
      border: "1px solid black !important",
      boxShadow: 3,
      width: (theme) => theme.spacing(logosWrapperSpacing * 0.7),
   },
   nextImageWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
   },
} as const;
const EventPreviewCard = ({ event, loading }: EventPreviewCardProps) => {
   const [eventInterests, setSetEventInterests] = useState([]);
   const [hosts, setHosts] = useState(undefined);

   const firebase = useFirebaseService();
   useEffect(() => {
      setSetEventInterests(
         existingDummyInterests.filter((interest) =>
            event.interestsIds.includes(interest.id)
         )
      );
   }, [event.interestsIds]);

   useEffect(() => {
      (async function getHosts() {
         const newHosts = await firebase.getCareerCentersByGroupId(
            event.groupIds || []
         );
         setHosts(newHosts.length ? newHosts : null);
      })();
   }, [event.groupIds]);

   return (
      <Box sx={styles.root}>
         <Stack
            spacing={2}
            sx={styles.dateShareWrapper}
            justifyContent="space-between"
            alignItems={"center"}
            direction="row"
         >
            <Typography variant={"subtitle1"} sx={styles.date}>
               {DateUtil.eventPreviewDate(event.startDate)}
            </Typography>
            <IconButton>
               <ShareIcon fontSize={"large"} />
            </IconButton>
         </Stack>
         <Box
            sx={[
               styles.mainContentWrapper,
               {
                  "&:before": {
                     backgroundImage: `url(${event.backgroundImageUrl})`,
                  },
               },
               !loading && styles.mainContentHoverStyles,
            ]}
         >
            <Stack spacing={2} className="mainContent" sx={styles.mainContent}>
               <Box sx={styles.titleWrapper} className="titleWrapper">
                  <Typography
                     variant={"h6"}
                     className="title"
                     sx={styles.title}
                  >
                     {event.title + event.title}
                  </Typography>
                  <Stack
                     alignItems={"center"}
                     flexWrap="wrap"
                     sx={{ mt: 1 }}
                     direction={"row"}
                     spacing={1}
                     className="chipsWrapper"
                  >
                     {event.language?.code && (
                        <WhiteTagChip
                           icon={<LanguageIcon />}
                           variant="filled"
                           tooltipText={`This event is in ${event.language.name}`}
                           label={event.language.code.toUpperCase()}
                        />
                     )}
                     {eventInterests.slice(0, 1).map((interest) => (
                        <WhiteTagChip
                           key={interest.id}
                           variant="filled"
                           label={interest.name}
                        />
                     ))}
                     {eventInterests.length > 2 && (
                        <WhiteTagChip
                           variant="outlined"
                           label={`+ ${eventInterests.length - 2} more`}
                        />
                     )}
                  </Stack>
               </Box>
               <Typography sx={styles.summary}>{event.summary}</Typography>
               <Stack spacing={1} direction="row">
                  <Button
                     sx={styles.btn}
                     variant={"contained"}
                     color="primary"
                     size={"small"}
                  >
                     I'll attend
                  </Button>
                  <Button
                     sx={styles.btn}
                     variant={"contained"}
                     color={"secondary"}
                     size={"small"}
                  >
                     see details{" "}
                  </Button>
               </Stack>
            </Stack>
         </Box>
         <Stack spacing={2} direction={"row"} sx={styles.logosWrapper}>
            <CardMedia title="Your title">
               <div
                  style={{
                     position: "relative",
                     width: "100%",
                     height: "100%",
                  }}
               >
                  <Image
                     src={event.companyLogoUrl}
                     layout="fill"
                     objectFit="contain"
                  />
               </div>
            </CardMedia>
            <Box sx={styles.hostsWrapper}>
               {hosts && (
                  <Box>
                     <Typography sx={styles.hostedText} color="text.secondary">
                        HOSTED BY
                     </Typography>
                     <AvatarGroup max={2}>
                        {hosts.map((host) => (
                           <Avatar
                              variant="rounded"
                              key={host.id}
                              title={`${host.universityName}`}
                              sx={styles.hostAvatar}
                           >
                              <Box sx={styles.nextImageWrapper}>
                                 <Image
                                    src={host.logoUrl}
                                    layout="fill"
                                    objectFit="contain"
                                 />
                              </Box>
                           </Avatar>
                        ))}
                     </AvatarGroup>
                  </Box>
               )}
            </Box>
         </Stack>
      </Box>
   );
};

interface EventPreviewCardProps {
   event: LiveStreamEvent;
   loading?: boolean;
}
export default EventPreviewCard;
