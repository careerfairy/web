import React, { useCallback, useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import { alpha, Theme } from "@mui/material/styles"
import LanguageIcon from "@mui/icons-material/Language"
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
import Skeleton from "@mui/material/Skeleton"

import { Interest } from "../../../../types/interests"
import EventSEOSchemaScriptTag from "../EventSEOSchemaScriptTag"
import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"
import { marketingSignUpFormId } from "../../../cms/constants"
import { MARKETING_LANDING_PAGE_PATH } from "../../../../constants/routes"
import { useMarketingLandingPage } from "../../../cms/landing-page/MarketingLandingPageProvider"
import useTrackLivestreamImpressions from "../../../custom-hook/useTrackLivestreamImpressions"
import { placeholderBanner } from "../../../../constants/images"
import DateUtil from "../../../../util/DateUtil"
import CalendarIcon from "@mui/icons-material/CalendarToday"
import ClockIcon from "@mui/icons-material/AccessTime"
import EventPreviewCardChipLabels from "./EventPreviewCardChipLabels"
import { sxStyles } from "../../../../types/commonTypes"
import { gradientAnimation } from "../../../../materialUI/GlobalBackground/GlobalBackGround"

const styles = sxStyles({
   hideOnHoverContent: {
      position: "absolute",
      paddingX: 2,
      marginTop: "100px",
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      transition: (theme: Theme) => theme.transitions.create(["opacity"]),
   },
   backgroundImageWrapper: {
      display: "flex",
      height: "40%",
      width: "100%",
      position: "relative",
      transition: (theme: Theme) => theme.transitions.create(["transform"]),
      opacity: 1.2,
      backgroundImage: (theme) =>
         `linear-gradient(0deg, ${alpha(
            theme.palette.common.black,
            0.2
         )}, ${alpha(theme.palette.common.black, 0.1)})`,
   },
   backgroundImageLoader: {
      position: "absolute",
      inset: 0,
      height: "auto",
   },
   flippedCardContent: {
      position: "absolute",
      opacity: "0",
   },
   contentWrapper: {
      display: "flex",
      width: "100%",
      height: "60%",
      flexDirection: "column",
      padding: 2,
      paddingTop: 5,
      transition: (theme: Theme) => theme.transitions.create("transform"),
      background: (theme) =>
         theme.palette.mode === "dark" ? "background.paper" : "white",
   },
   title: {
      fontWeight: 700,
      ...getMaxLineStyles(2),
   },
   summary: {
      fontWeight: 500,
      ...getMaxLineStyles(2),
   },
   mainContentHoverStyles: {
      "&:hover, &:focus-within": {
         "& .contentWrapper": {
            transform: "translateY(-70%)",
            padding: { xs: 3, md: 4 },
            background: "unset",
         },
         "& .flippedCardContent": {
            position: "unset",
            opacity: "1",
            display: "flex",
            justifyContent: "center",
            mt: 6,
         },
         "& .hideOnHoverContent": {
            opacity: 0,
         },
         "& .hideOnHoverContent2": {
            display: "none",
         },
         "& .backgroundImageWrapper": {
            position: "unset",
            opacity: 0.1,
         },
         "& .title": (theme) => ({
            [theme.breakpoints.up("md")]: {
               ...getMaxLineStyles(2),
            },
         }),
         "& .summary": {
            ...getMaxLineStyles(3),
            color: "text.primary",
            marginTop: 1,
         },
         "& .chipsWrapper": {
            display: "none",
         },
         "&:after": {
            transform: "translateY(-50%)",
         },
      },
   },
   mainAndLowerContentWrapper: {
      borderRadius: (theme) => theme.spacing(2),
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      marginY: 2,
   },
   mainContentWrapper: {
      position: "relative",
      height: (theme) => theme.spacing(43),
      display: "flex",
      flexDirection: "column",
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
         transform: "translateY(0)",
      },
   },
   cardIsLive: {
      marginY: 1.5,
      background:
         "linear-gradient(white, white) padding-box, linear-gradient(180deg, #e9911d, #dc2743 50%, #e9911d) border-box",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%, 100% 200%",
      backgroundPosition: "0 0, 0 100%",
      border: "4px solid transparent",
      animation: `${gradientAnimation} 1s infinite alternate`,
   },
   btn: {
      width: "40%",
   },
   companyAvatar: {
      padding: 1,
      backgroundColor: "white",
      boxShadow: 3,
      border: "none !important",
      width: 110,
      height: 60,
      borderRadius: 3,
   },
   calendarDate: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      justifyContent: "center",
      backgroundColor: "white",
      boxShadow: 3,
      border: "none !important",
      width: 58,
      height: 60,
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
})

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
   isRecommended,
   totalElements,
   index,
   location = ImpressionLocation.unknown,
   isEmbedded = false,
}: EventPreviewCardProps) => {
   const isPlaceholderEvent = event?.id.includes("placeholderEvent")

   const ref = useTrackLivestreamImpressions({
      event,
      isRecommended,
      positionInResults: index,
      numberOfResults: totalElements,
      location,
      disableTracking: isPlaceholderEvent,
   })
   const { query, push, pathname } = useRouter()
   const [eventInterests, setEventInterests] = useState([])
   const firebase = useFirebaseService()
   const { authenticatedUser } = useAuth()
   const [hosts, setHosts] = useState(undefined)
   const [isPast, setIsPast] = useState(checkIfPast(event))
   const isOnMarketingLandingPage = pathname.includes(
      MARKETING_LANDING_PAGE_PATH
   )
   const { formCompleted: marketingFormCompleted, setSelectedEventId } =
      useMarketingLandingPage()

   const hasRegistered = useMemo<boolean>(() => {
      if (loading) return false

      return Boolean(event?.registeredUsers?.includes(authenticatedUser?.email))
   }, [loading, event?.registeredUsers, authenticatedUser?.email])

   const hasParticipated = useMemo<boolean>(() => {
      if (loading) return false

      return Boolean(
         event?.participatingStudents?.includes(authenticatedUser?.email)
      )
   }, [loading, event?.participatingStudents, authenticatedUser?.email])

   const hasJobsToApply = useMemo<boolean>(() => {
      if (loading) return false

      return Boolean(event?.jobs?.length)
   }, [event?.jobs?.length, loading])

   const {
      query: { groupId },
   } = useRouter()

   useEffect(() => {
      if (!loading && interests) {
         setEventInterests(
            interests.filter((interest) =>
               event?.interestsIds?.includes(interest.id)
            )
         )
      }
   }, [event?.interestsIds, loading, interests])

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
         !event?.registeredUsers?.includes(authenticatedUser.email)
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

   const startDate = useMemo<Date>(
      () => event?.startDate || event?.start?.toDate?.(),
      [event?.start, event?.startDate]
   )
   const getStartDay = useMemo<number>(() => {
      return new Date(startDate).getDate()
   }, [startDate])

   const getStartMonth = useMemo<string>(() => {
      return DateUtil.getMonth(new Date(startDate).getMonth(), true)
   }, [startDate])

   const getStartHour = useMemo<string>(() => {
      return DateUtil.eventPreviewHour(startDate)
   }, [startDate])

   const getPastEventDate = useMemo<string>(
      () => DateUtil.pastEventPreviewDate(startDate),
      [startDate]
   )

   const handleShareClick = useCallback(() => {
      openShareDialog?.(event)
   }, [event, openShareDialog])

   const onClickRegister = useCallback(() => {
      onRegisterClick(event, hosts?.[0]?.id, hosts, hasRegistered)
   }, [event, hasRegistered, hosts, onRegisterClick])

   const getHref = useCallback(() => {
      if (
         isOnMarketingLandingPage &&
         !authenticatedUser.email &&
         !marketingFormCompleted
      ) {
         return `#${marketingSignUpFormId}`
      }
      return {
         pathname: `/upcoming-livestream/[livestreamId]`,
         // when an event has jobs and is in the past, we show a button for the
         // user apply in the countdown area, we don't want the user to auto scroll to the
         // about section in that case
         hash: isPast && !event?.jobs?.length && "#about",
         query: {
            livestreamId: event?.id,
            ...(event?.groupIds?.includes(groupId as string) && { groupId }),
         },
      }
   }, [
      authenticatedUser.email,
      event?.groupIds,
      event?.id,
      event?.jobs?.length,
      groupId,
      isOnMarketingLandingPage,
      isPast,
      marketingFormCompleted,
   ])

   const handleDetailsClick = useCallback(() => {
      if (isOnMarketingLandingPage) {
         setSelectedEventId(event?.id)
      }
   }, [event?.id, isOnMarketingLandingPage, setSelectedEventId])

   const isLive = useMemo(
      () => event?.hasStarted && !isPast,
      [event?.hasStarted, isPast]
   )

   const renderFlippedCard = useCallback(
      () => (
         <Stack
            spacing={3}
            direction={"column"}
            alignItems={"center"}
            width={"100%"}
         >
            {isLive ? (
               <Button
                  component={Link}
                  /* @ts-ignore */
                  href={getHref()}
                  variant={"contained"}
                  color={"primary"}
                  size={"medium"}
                  onClick={handleDetailsClick}
                  target={isEmbedded ? "_blank" : "_self"}
               >
                  Join Stream
               </Button>
            ) : (
               <Box
                  sx={{
                     display: "flex",
                     width: "100%",
                     justifyContent:
                        isPlaceholderEvent ||
                        isPast ||
                        isOnMarketingLandingPage ||
                        isEmbedded
                           ? "center"
                           : "space-between",
                  }}
               >
                  {onRegisterClick && !isPast && !isOnMarketingLandingPage ? (
                     <Button
                        sx={styles.btn}
                        onClick={onClickRegister}
                        variant={hasRegistered ? "outlined" : "contained"}
                        color={hasRegistered ? "secondary" : "primary"}
                        disabled={registering}
                        size={"small"}
                     >
                        {hasRegistered ? "cancel" : "Attend"}
                     </Button>
                  ) : null}

                  {!isPlaceholderEvent ? (
                     <Button
                        sx={styles.btn}
                        component={Link}
                        /* @ts-ignore */
                        href={getHref()}
                        variant={"contained"}
                        color={"secondary"}
                        size={"small"}
                        onClick={handleDetailsClick}
                        target={isEmbedded ? "_blank" : "_self"}
                     >
                        Details
                     </Button>
                  ) : null}
               </Box>
            )}
            {isPlaceholderEvent || isEmbedded ? null : (
               <Box
                  sx={{
                     display: "flex",
                     width: "100%",
                     justifyContent: "center",
                  }}
               >
                  <Typography
                     sx={{ textDecoration: "underline", cursor: "pointer" }}
                     fontWeight={500}
                     variant={"body1"}
                     color={"text.primary"}
                     onClick={
                        isOnMarketingLandingPage ? null : handleShareClick
                     }
                  >
                     Share
                  </Typography>
               </Box>
            )}
            <Box
               sx={{ display: "flex", width: "100%", justifyContent: "center" }}
            >
               {isPlaceholderEvent ? (
                  <Typography
                     sx={{ mt: 6 }}
                     variant={"body1"}
                     color={"text.primary"}
                  >
                     Coming soon
                  </Typography>
               ) : (
                  <Box sx={{ display: "flex" }}>
                     <Typography
                        sx={{ display: "flex", alignItems: "center" }}
                        variant={"body1"}
                        color={"text.primary"}
                     >
                        <CalendarIcon fontSize={"inherit"} sx={{ mr: 1 }} />
                        {getStartDay} {getStartMonth}
                        <ClockIcon fontSize={"inherit"} sx={{ ml: 2, mr: 1 }} />
                        {getStartHour}
                     </Typography>
                  </Box>
               )}
            </Box>
         </Stack>
      ),
      [
         getHref,
         getStartDay,
         getStartHour,
         getStartMonth,
         handleDetailsClick,
         handleShareClick,
         hasRegistered,
         isLive,
         isOnMarketingLandingPage,
         isPast,
         isPlaceholderEvent,
         onClickRegister,
         onRegisterClick,
         registering,
      ]
   )

   return (
      <>
         <Box ref={ref}>
            <Box
               sx={[
                  styles.mainAndLowerContentWrapper,
                  isLive && styles.cardIsLive,
               ]}
            >
               <Box
                  sx={[
                     styles.mainContentWrapper,
                     !loading && styles.mainContentHoverStyles,
                  ]}
               >
                  <Box
                     className="backgroundImageWrapper"
                     sx={styles.backgroundImageWrapper}
                  >
                     {loading ? (
                        <Skeleton
                           animation={animation ?? "wave"}
                           variant="rectangular"
                           sx={styles.backgroundImageLoader}
                        />
                     ) : (
                        <>
                           <Image
                              alt="Illustration"
                              src={
                                 getResizedUrl(
                                    event?.backgroundImageUrl,
                                    "lg"
                                 ) || placeholderBanner
                              }
                              layout="fill"
                              priority
                              objectFit="cover"
                           />
                        </>
                     )}
                  </Box>

                  <EventPreviewCardChipLabels
                     hasParticipated={hasParticipated}
                     isPast={isPast}
                     isLive={isLive}
                     hasRegistered={hasRegistered}
                     hasJobToApply={hasJobsToApply}
                  />

                  <Box
                     className="hideOnHoverContent"
                     sx={[styles.hideOnHoverContent, { zIndex: 1 }]}
                  >
                     {isPlaceholderEvent || isPast ? null : (
                        <Box sx={{ display: "flex" }}>
                           {loading ? (
                              <Skeleton
                                 animation={animation ?? "wave"}
                                 variant="rectangular"
                                 sx={{ borderRadius: 3 }}
                                 width={58}
                                 height={60}
                              />
                           ) : (
                              <Box sx={styles.calendarDate}>
                                 <Typography
                                    variant={"h5"}
                                    color={"secondary"}
                                    fontWeight={600}
                                 >
                                    {getStartDay}
                                 </Typography>
                                 <Typography
                                    variant={"body1"}
                                    color={"black"}
                                    fontWeight={500}
                                 >
                                    {getStartMonth}
                                 </Typography>
                              </Box>
                           )}
                        </Box>
                     )}

                     <Box sx={{ display: "flex" }}>
                        {loading ? (
                           <Skeleton
                              animation={animation ?? "wave"}
                              variant="rectangular"
                              sx={{ borderRadius: 3 }}
                              width={110}
                              height={60}
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
                                    alt={`logo of company ${event.company}`}
                                 />
                              </Box>
                           </Avatar>
                        )}
                     </Box>
                  </Box>
                  <Box
                     className="contentWrapper"
                     sx={[
                        styles.contentWrapper,
                        isPast ? { paddingTop: 4 } : null,
                     ]}
                  >
                     {isPast ? (
                        <Box
                           className="hideOnHoverContent2"
                           sx={{
                              display: "flex",
                              mb: 1,
                              justifyContent: "space-between",
                           }}
                        >
                           <Typography
                              sx={{ display: "flex", alignItems: "center" }}
                              fontSize={12}
                              color={"text.secondary"}
                           >
                              <CalendarIcon
                                 fontSize={"inherit"}
                                 sx={{ mr: 0.5 }}
                              />
                              {getPastEventDate}
                           </Typography>

                           <Typography
                              sx={{ display: "flex", alignItems: "center" }}
                              fontSize={12}
                              color={"text.secondary"}
                           >
                              {event.duration} min
                           </Typography>
                        </Box>
                     ) : null}

                     <Box sx={{ display: "flex" }}>
                        <Typography
                           variant={"body1"}
                           color="text.primary"
                           sx={styles.title}
                        >
                           {loading ? (
                              <Skeleton
                                 animation={animation}
                                 variant="rectangular"
                                 sx={{ mt: 5, borderRadius: 3 }}
                                 width={300}
                                 height={16}
                              />
                           ) : (
                              event?.title
                           )}
                        </Typography>
                     </Box>

                     <Box display={"flex"} mt={1}>
                        <Typography
                           variant={"body2"}
                           color="text.secondary"
                           sx={styles.summary}
                           className="summary"
                        >
                           {loading ? (
                              <Skeleton
                                 animation={animation}
                                 variant="rectangular"
                                 sx={{ borderRadius: 3 }}
                                 width={300}
                                 height={16}
                              />
                           ) : (
                              event?.summary
                           )}
                        </Typography>
                     </Box>

                     <Box
                        className="flippedCardContent"
                        sx={styles.flippedCardContent}
                     >
                        {renderFlippedCard()}
                     </Box>

                     <Box
                        className="chipsWrapper"
                        sx={{
                           display: "flex",
                           height: "100%",
                           alignItems: "end",
                        }}
                     >
                        <Stack spacing={1} direction={"row"}>
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
                                 {event?.language?.code ? (
                                    <WhiteTagChip
                                       icon={<LanguageIcon />}
                                       variant="filled"
                                       tooltipText={`This event is in ${event?.language.name}`}
                                       label={event?.language.code.toUpperCase()}
                                       sx={{ border: "1px solid black" }}
                                    />
                                 ) : null}
                                 {eventInterests.slice(0, 1).map((interest) => (
                                    <WhiteTagChip
                                       key={interest.id}
                                       variant="filled"
                                       sx={{
                                          maxWidth:
                                             eventInterests.length > 2
                                                ? "50%"
                                                : "80%",
                                          border: "1px solid black",
                                       }}
                                       label={interest.name}
                                    />
                                 ))}
                                 {eventInterests.length > 2 ? (
                                    <WhiteTagChip
                                       variant="filled"
                                       sx={{ border: "1px solid black" }}
                                       label={`+ ${eventInterests.length - 2}`}
                                    />
                                 ) : null}
                              </>
                           )}
                        </Stack>
                     </Box>
                  </Box>
               </Box>
            </Box>
         </Box>
         {event ? <EventSEOSchemaScriptTag event={event} /> : null}
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
   isRecommended?: boolean
   // The index of the event in the list
   index?: number
   // The total number of events in the list
   totalElements?: number
   location?: ImpressionLocation
   isEmbedded?: boolean
}

export default EventPreviewCard
