import React, {
   forwardRef,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { alpha, Theme } from "@mui/material/styles"
import LanguageIcon from "@mui/icons-material/Language"
import {
   getMaxLineStyles,
   getResizedUrl,
   isInIframe,
} from "components/helperFunctions/HelperFunctions"
import WhiteTagChip from "../chips/TagChip"
import Image from "next/image"
import Avatar from "@mui/material/Avatar"
import { useRouter } from "next/router"
import { checkIfPast } from "util/streamUtil"
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
import EventPreviewCardChipLabels from "./EventPreviewCardChipLabels"
import { sxStyles } from "../../../../types/commonTypes"
import { gradientAnimation } from "../../../../materialUI/GlobalBackground/GlobalBackGround"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import Link, { LinkProps } from "next/link"
import { CardActionArea } from "@mui/material"
import {
   buildDialogLink,
   isOnlivestreamDialogPage,
} from "../../livestream-dialog"
import CircularLogo from "../CircularLogo"

const bottomContentHeight = 50
const cardAvatarSize = 65

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
   backgroundImageWrapperWithBottomContent: {
      height: `calc(40% + ${bottomContentHeight / 2}px)`,
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
   companyAvatar: {
      padding: 1,
      border: "solid 2px white",
      backgroundColor: "white",
      width: cardAvatarSize,
      height: cardAvatarSize,
   },
   calendarDate: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      justifyContent: "center",
      backgroundColor: "white",
      boxShadow: "0px 10px 15px -10px rgba(0,0,0,0.1)",
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
   cursorPointer: {
      cursor: "pointer",
   },
   cardWrapper: {
      borderRadius: (theme) => theme.spacing(2),
      "& .backgroundImage": {
         transition: (theme: Theme) => theme.transitions.create(["transform"]),
      },
      "&:hover, &:focus-within": {
         "& .backgroundImage": {
            transform: "scale(1.1)",
         },
      },
   },
})

const EventPreviewCard = forwardRef<HTMLDivElement, EventPreviewCardProps>(
   (
      {
         event,
         loading,
         light,
         interests,
         animation,
         isRecommended,
         totalElements,
         index,
         location = ImpressionLocation.unknown,
         isEmbedded = false,
         bottomElement,
         hideChipLabels,
         disableClick,
      }: EventPreviewCardProps,
      ref
   ) => {
      const isPlaceholderEvent = event?.id.includes("placeholderEvent")

      const trackImpressionsRef = useTrackLivestreamImpressions({
         event,
         isRecommended,
         positionInResults: index,
         numberOfResults: totalElements,
         location,
         disableTracking: isPlaceholderEvent,
      })
      const router = useRouter()
      const { pathname } = router
      const [eventInterests, setEventInterests] = useState([])
      const { authenticatedUser, isLoggedIn } = useAuth()
      const [isPast, setIsPast] = useState(checkIfPast(event))

      const isOnMarketingLandingPage = pathname.includes(
         MARKETING_LANDING_PAGE_PATH
      )
      const { formCompleted: marketingFormCompleted, setSelectedEventId } =
         useMarketingLandingPage()

      const presenterEvent = useMemo(
         () => (event ? LivestreamPresenter.createFromDocument(event) : null),
         [event]
      )

      const hasRegistered = useMemo<boolean>(() => {
         if (loading) return false

         return Boolean(
            event?.registeredUsers?.includes(authenticatedUser?.email)
         )
      }, [loading, event?.registeredUsers, authenticatedUser?.email])

      const hasParticipated = useMemo<boolean>(() => {
         if (loading) return false

         return Boolean(
            event?.participatingStudents?.includes(authenticatedUser?.email)
         )
      }, [loading, event?.participatingStudents, authenticatedUser?.email])

      const hasJobsToApply = useMemo<boolean>(() => {
         if (loading) return false

         return Boolean(
            event?.hasJobs ||
               event?.jobs?.length > 0 ||
               event?.customJobs?.length > 0
         )
      }, [
         event?.customJobs?.length,
         event?.hasJobs,
         event?.jobs?.length,
         loading,
      ])

      const getRecordingAvailableDays = useMemo<number | null>(() => {
         if (isPast && isLoggedIn && presenterEvent) {
            if (
               presenterEvent.isAbleToShowRecording(authenticatedUser?.email)
            ) {
               const timeLeft = DateUtil.calculateTimeLeft(
                  presenterEvent.recordingAccessTimeLeft()
               )

               return timeLeft?.Days + 1
            }
         }

         return null
      }, [isPast, isLoggedIn, authenticatedUser?.email, presenterEvent])

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
         if (!loading) {
            setIsPast(checkIfPast(event))
         }
      }, [event?.start, loading])

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

      const getPastEventDate = useMemo<string>(
         () => DateUtil.formatDateToString(startDate),
         [startDate]
      )

      const handleDetailsClick = useCallback(() => {
         if (isOnMarketingLandingPage) {
            setSelectedEventId(event?.id)
         }
      }, [event?.id, isOnMarketingLandingPage, setSelectedEventId])

      const isLive = useMemo(
         () => event?.hasStarted && !isPast,
         [event?.hasStarted, isPast]
      )

      const linkProps = useMemo<LinkProps>(() => {
         if (!presenterEvent?.id) {
            return {
               href: "",
            }
         }

         if (
            presenterEvent.isLive() &&
            presenterEvent.isUserRegistered(authenticatedUser.email)
         ) {
            return {
               href: presenterEvent.getViewerEventRoomLink(),
            }
         }

         const eventLink = buildDialogLink({
            router,
            link: {
               type: "livestreamDetails",
               livestreamId: presenterEvent.id,
            },
         })

         if (
            isOnMarketingLandingPage &&
            !authenticatedUser.email &&
            !marketingFormCompleted
         ) {
            return {
               href: `#${marketingSignUpFormId}`,
            }
         }

         // Fall back to the default portal link and open the event in a new tab
         return {
            href: eventLink,
            target: isOnlivestreamDialogPage(pathname) ? undefined : "_blank",
         }
      }, [
         authenticatedUser.email,
         presenterEvent,
         isOnMarketingLandingPage,
         marketingFormCompleted,
         pathname,
         router,
      ])

      return (
         <>
            <Link
               {...linkProps}
               shallow // Prevents GSSP from running on designated page:https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing
               passHref
               scroll={false} // Prevents the page from scrolling to the top when the link is clicked
            >
               <CardActionArea
                  component={event ? "a" : "div"}
                  sx={[event && styles.cursorPointer, styles.cardWrapper]}
                  ref={trackImpressionsRef}
                  target={isInIframe() ? "_blank" : undefined}
                  onClick={handleDetailsClick}
                  data-testid={`livestream-card-${event?.id}`}
                  disabled={disableClick}
               >
                  <Box
                     ref={ref}
                     sx={[
                        styles.mainAndLowerContentWrapper,
                        isLive && styles.cardIsLive,
                     ]}
                  >
                     <Box sx={styles.mainContentWrapper}>
                        <Box
                           className="backgroundImageWrapper"
                           sx={[
                              styles.backgroundImageWrapper,
                              bottomElement &&
                                 styles.backgroundImageWrapperWithBottomContent,
                           ]}
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
                                    className="backgroundImage"
                                 />
                              </>
                           )}
                        </Box>

                        {hideChipLabels ? null : (
                           <EventPreviewCardChipLabels
                              hasParticipated={hasParticipated}
                              isPast={isPast}
                              isLive={isLive}
                              hasRegistered={hasRegistered}
                              hasJobToApply={hasJobsToApply}
                              recordingAvailableDays={getRecordingAvailableDays}
                           />
                        )}

                        <Box
                           className="hideOnHoverContent"
                           sx={[styles.hideOnHoverContent, { zIndex: 1 }]}
                        >
                           <Box sx={{ display: "flex" }}>
                              {loading ? (
                                 <Skeleton
                                    animation={animation ?? "wave"}
                                    variant="circular"
                                    width={cardAvatarSize}
                                    height={cardAvatarSize}
                                 />
                              ) : (
                                 <CircularLogo
                                    src={event?.companyLogoUrl}
                                    alt={`logo of company ${event?.company}`}
                                    size={cardAvatarSize}
                                    objectFit="contain"
                                 />
                              )}
                           </Box>
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
                                          color={"#2ABAA5"}
                                          fontWeight={600}
                                       >
                                          {getStartDay}
                                       </Typography>
                                       <Typography
                                          variant={"body1"}
                                          color={"black !important"}
                                          fontWeight={500}
                                       >
                                          {getStartMonth}
                                       </Typography>
                                    </Box>
                                 )}
                              </Box>
                           )}
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
                                 className="hidePastDateOnHover"
                                 sx={{
                                    display: "flex",
                                    mb: 1,
                                    justifyContent: "space-between",
                                 }}
                              >
                                 <Typography
                                    sx={{
                                       display: "flex",
                                       alignItems: "center",
                                    }}
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
                                    sx={{
                                       display: "flex",
                                       alignItems: "center",
                                    }}
                                    fontSize={12}
                                    color={"text.secondary"}
                                 >
                                    {event?.duration} min
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
                           ></Box>

                           <Box
                              className="chipsWrapper"
                              sx={{
                                 display: "flex",
                                 height: 32,
                                 alignItems: "end",
                                 mt: "auto",
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
                                       {eventInterests
                                          .slice(0, 1)
                                          .map((interest) => (
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
                                             label={`+ ${
                                                eventInterests.length - 2
                                             }`}
                                          />
                                       ) : null}
                                    </>
                                 )}
                              </Stack>
                           </Box>
                        </Box>
                        {bottomElement ? (
                           <Box
                              bgcolor="background.paper"
                              width="100%"
                              display="flex"
                              height={bottomContentHeight}
                           >
                              {bottomElement}
                           </Box>
                        ) : null}
                     </Box>
                  </Box>
                  {event ? <EventSEOSchemaScriptTag event={event} /> : null}
               </CardActionArea>
            </Link>
         </>
      )
   }
)

interface EventPreviewCardProps {
   event?: LivestreamEvent
   loading?: boolean
   light?: boolean
   interests?: Interest[]
   // Animate the loading animation, defaults to the "wave" prop
   animation?: false | "wave" | "pulse"
   isRecommended?: boolean
   // The index of the event in the list
   index?: number
   // The total number of events in the list
   totalElements?: number
   location?: ImpressionLocation
   ref?: React.Ref<HTMLDivElement>
   isEmbedded?: boolean
   bottomElement?: React.ReactNode
   // If true, the chip labels will be hidden
   hideChipLabels?: boolean
   disableClick?: boolean
}

EventPreviewCard.displayName = "EventPreviewCard"

export default EventPreviewCard
