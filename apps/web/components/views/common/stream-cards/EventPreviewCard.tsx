import React, { useCallback, useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import { alpha, Theme } from "@mui/material/styles"
import LanguageIcon from "@mui/icons-material/Language"
import CheckIcon from "@mui/icons-material/CheckCircle"
import {
   getMaxLineStyles,
   getResizedUrl,
} from "components/helperFunctions/HelperFunctions"
import WhiteTagChip from "../chips/TagChip"
import Image from "next/image"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import Avatar from "@mui/material/Avatar"
import { useRouter } from "next/router"
import Link from "components/views/common/Link"
import { checkIfPast, getRelevantHosts } from "util/streamUtil"
import { useAuth } from "HOCs/AuthProvider"
import LiveIcon from "@mui/icons-material/RadioButtonChecked"
import Skeleton from "@mui/material/Skeleton"

import { Chip, useMediaQuery } from "@mui/material"
import DateAndShareDisplay from "./common/DateAndShareDisplay"
import { Interest } from "../../../../types/interests"
import EventSEOSchemaScriptTag from "../EventSEOSchemaScriptTag"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { marketingSignUpFormId } from "../../../cms/constants"

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
         "& .titleWrapper": {
            transform: "translateY(0)",
         },
         "& .hideOnHoverContent": {
            opacity: 0,
         },
         "& .backgroundImage": {
            transform: "scale(1.1)",
         },
         "& .title": (theme) => ({
            [theme.breakpoints.up("md")]: {
               ...getMaxLineStyles(2),
            },
         }),
         "& .chipsWrapper": {
            display: "none",
         },
         "& .mainContent": {
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
      borderRadius: (theme) => theme.spacing(0.2, 0.2, 1, 1),
      overflow: "hidden",
      boxShadow: 2,
   },
   mainContentWrapper: {
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
               1
            )}, ${alpha(theme.palette.common.black, 0.1)})`,
         transform: "translateY(0)",
      },
   },
   mainContent: {
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
   titleWrapper: {
      transition: (theme: Theme) => theme.transitions.create("transform"),
      transform: "translateY(120px)",
   },
   title: {
      fontWeight: 600,
      ...getMaxLineStyles(2),
      textShadow: (theme) => theme.darkTextShadow,
   },
   summary: {
      ...getMaxLineStyles(3),
      minHeight: 50,
   },
   btn: {
      flex: 1,
   },
   bottomLogoWrapper: {
      display: "grid",
      placeItems: "center",
      flex: 0.2,
   },
   companyAvatar: {
      padding: 1.5,
      backgroundColor: "white",
      boxShadow: 3,
      border: "none !important",
      width: 130,
      height: 80,
      borderRadius: 3,
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
} as const

const EventPreviewCard = ({
   event,
   loading,
   light,
   onRegisterClick,
   registering,
   interests,
   animation,
   autoRegister,
   openShareDialog,
   isOnLandingPage = false,
}: EventPreviewCardProps) => {
   const mobile = useMediaQuery("(max-width:700px)")
   const { query, push, pathname } = useRouter()
   const getStartDate = () => event?.startDate || event?.start?.toDate?.()
   const [eventInterests, setSetEventInterests] = useState([])
   const [hasRegistered, setHasRegistered] = useState(false)
   const firebase = useFirebaseService()
   const { authenticatedUser } = useAuth()
   const [hosts, setHosts] = useState(undefined)
   const [isPast, setIsPast] = useState(checkIfPast(event))
   const isPlaceholderEvent = event?.id.includes("placeholderEvent")

   const {
      query: { groupId },
   } = useRouter()

   useEffect(() => {
      if (!loading && interests) {
         setSetEventInterests(
            interests.filter((interest) =>
               event?.interestsIds?.includes(interest.id)
            )
         )
      }
   }, [event?.interestsIds, loading, interests])

   useEffect(() => {
      if (!loading) {
         setHasRegistered(
            Boolean(event?.registeredUsers?.includes(authenticatedUser?.email))
         )
      }
   }, [event?.registeredUsers, loading, authenticatedUser?.email])

   useEffect(() => {
      if (!light && !loading) {
         ;(async function getHosts() {
            const newHosts = await firebase.getCareerCentersByGroupId(
               event?.groupIds || []
            )

            setHosts(
               newHosts.length
                  ? getRelevantHosts(groupId as string, event, newHosts)
                  : null
            )
         })()
      }
   }, [event, firebase, groupId, light, loading])

   useEffect(() => {
      if (!loading) {
         setIsPast(checkIfPast(event))
      }
   }, [event?.start, loading])

   useEffect(() => {
      if (
         !loading &&
         autoRegister &&
         query.register &&
         query.register === event?.id &&
         hosts?.length &&
         !event.registeredUsers.includes(authenticatedUser.email)
      ) {
         ;(async function handleAutoRegister() {
            const newQuery = { ...query }
            if (newQuery.register) {
               delete newQuery.register
            }
            await push({
               pathname: pathname,
               query: {
                  ...newQuery,
               },
            })
            onClickRegister()
         })()
      }
   }, [
      query.register,
      event?.id,
      hosts,
      event?.registeredUsers,
      authenticatedUser.email,
      autoRegister,
      loading,
   ])

   const handleShareClick = () => {
      openShareDialog?.(event)
   }

   const onClickRegister = () => {
      onRegisterClick(event, hosts?.[0]?.id, hosts, hasRegistered)
   }

   const getHref = useCallback(() => {
      if (isOnLandingPage && !onRegisterClick) {
         return `#${marketingSignUpFormId}`
      }
      return {
         pathname: `/upcoming-livestream/[livestreamId]`,
         hash: isPast && "#about",
         query: {
            livestreamId: event?.id,
            ...(event?.groupIds?.includes(groupId as string) && { groupId }),
         },
      }
   }, [
      event?.groupIds,
      event?.id,
      groupId,
      isOnLandingPage,
      isPast,
      onRegisterClick,
   ])

   return (
      <>
         <Box>
            <DateAndShareDisplay
               startDate={getStartDate()}
               loading={loading}
               onShareClick={handleShareClick}
               isPlaceholderEvent={isPlaceholderEvent}
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
                     <Box sx={styles.hostsWrapper}>
                        {loading ? (
                           <Skeleton
                              animation={animation ?? "wave"}
                              variant="rectangular"
                              sx={{ borderRadius: 3 }}
                              width={130}
                              height={80}
                           />
                        ) : (
                           <Avatar
                              title={`${event?.company}`}
                              variant="rounded"
                              sx={styles.companyAvatar}
                           >
                              <Box sx={styles.nextImageWrapper}>
                                 <Image
                                    src={getResizedUrl(
                                       event?.companyLogoUrl,
                                       "lg"
                                    )}
                                    layout="fill"
                                    objectFit="contain"
                                    quality={100}
                                 />
                              </Box>
                           </Avatar>
                        )}
                     </Box>
                     <Stack justifyContent="end" direction={"row"} spacing={2}>
                        {loading ? (
                           <>
                              <Skeleton
                                 animation={animation}
                                 sx={styles.chipLoader}
                              />
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
                           flexWrap="nowrap"
                           sx={{ mt: 1 }}
                           direction={"row"}
                           spacing={1}
                           className="chipsWrapper"
                        >
                           {loading ? (
                              <>
                                 <Skeleton
                                    animation={animation}
                                    sx={styles.chipLoader}
                                 />
                                 <Skeleton
                                    animation={animation}
                                    sx={styles.chipLoader}
                                 />
                              </>
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
                                 {eventInterests.slice(0, 1).map((interest) => (
                                    <WhiteTagChip
                                       key={interest.id}
                                       variant="filled"
                                       sx={{
                                          maxWidth:
                                             eventInterests.length > 2
                                                ? "50%"
                                                : "80%",
                                       }}
                                       label={interest.name}
                                    />
                                 ))}
                                 {eventInterests.length > 2 && (
                                    <WhiteTagChip
                                       variant="outlined"
                                       label={`+ ${eventInterests.length - 2}`}
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
                              {onRegisterClick &&
                                 !isPast &&
                                 !isPlaceholderEvent && (
                                    <Button
                                       sx={styles.btn}
                                       onClick={onClickRegister}
                                       variant={
                                          hasRegistered
                                             ? "outlined"
                                             : "contained"
                                       }
                                       color={
                                          hasRegistered ? "info" : "primary"
                                       }
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

                              {!isPlaceholderEvent && (
                                 <Button
                                    sx={styles.btn}
                                    component={Link}
                                    /*
                                             // @ts-ignore */
                                    href={getHref()}
                                    variant={"contained"}
                                    color={"secondary"}
                                    size={"small"}
                                 >
                                    {mobile ? "details" : "see details"}
                                 </Button>
                              )}
                           </Stack>
                        </>
                     )}
                  </Stack>
               </Box>
            </Box>
         </Box>
         {event && <EventSEOSchemaScriptTag event={event} />}
      </>
   )
}

interface EventPreviewCardProps {
   event?: LivestreamEvent
   loading?: boolean
   light?: boolean
   registering?: boolean
   autoRegister?: boolean
   interests?: Interest[]
   openShareDialog?: React.Dispatch<React.SetStateAction<LivestreamEvent>>
   onRegisterClick?: (
      event: LivestreamEvent,
      targetGroupId: string,
      groups: any[],
      hasRegistered: boolean
   ) => any
   // Animate the loading animation, defaults to the "wave" prop
   animation?: false | "wave" | "pulse"
   isOnLandingPage?: boolean
}

export default EventPreviewCard
