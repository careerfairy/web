import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import CalendarIcon from "@mui/icons-material/CalendarToday"
import { CardActionArea } from "@mui/material"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { Theme, alpha } from "@mui/material/styles"
import { usePartnership } from "HOCs/PartnershipProvider"
import useCustomJobsCount from "components/custom-hook/custom-job/useCustomJobsCount"
import { useUserHasParticipated } from "components/custom-hook/live-stream/useUserHasParticipated"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { useIsInTalentGuide } from "components/custom-hook/utils/useIsInTalentGuide"
import {
   getMaxLineStyles,
   getResizedUrl,
   isInIframe,
} from "components/helperFunctions/HelperFunctions"
import { useLiveStreamDialog } from "components/views/talent-guide/blocks/live-stream/LiveStreamDialogContext"
import Image from "next/legacy/image"
import Link, { LinkProps } from "next/link"
import { useRouter } from "next/router"
import React, {
   forwardRef,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import { Globe } from "react-feather"
import { useInView } from "react-intersection-observer"
import { checkIfPast } from "util/streamUtil"
import { placeholderBanner } from "../../../../constants/images"
import { gradientAnimation } from "../../../../materialUI/GlobalBackground/GlobalBackGround"
import { sxStyles } from "../../../../types/commonTypes"
import DateUtil from "../../../../util/DateUtil"
import useTrackLivestreamImpressions from "../../../custom-hook/useTrackLivestreamImpressions"
import {
   buildDialogLink,
   isOnlivestreamDialogPage,
} from "../../livestream-dialog"
import EventSEOSchemaScriptTag from "../EventSEOSchemaScriptTag"
import WhiteTagChip from "../chips/TagChip"
import CircularLogo from "../logos/CircularLogo"
import EventPreviewCardChipLabels from "./EventPreviewCardChipLabels"

const bottomContentHeight = 50
const cardAvatarSize = 65

const styles = sxStyles({
   backgroundImageWrapper: {
      filter: "brightness(75%)",
      display: "flex",
      height: "112px",
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
      height: `calc(112px + ${bottomContentHeight / 2}px)`,
   },
   backgroundImageLoader: {
      position: "absolute",
      inset: 0,
      height: "auto",
   },
   contentWrapper: {
      display: "flex",
      width: "100%",
      flexDirection: "column",
      marginTop: "-12px",
      padding: "0px 16px 16px 16px",
      transition: (theme: Theme) => theme.transitions.create("transform"),
      justifyContent: "flex-end",
      alignItems: "flex-start",
      gap: "16px",
   },
   headerWrapper: {
      display: "flex",
      width: "100%",
      gap: "8px",
   },
   companyNameWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      flex: "1 0 0",
      flexDirection: "column",
      color: (theme) => theme.palette.neutral[700],
      fontWeight: 600,
      overflow: "hidden",
   },
   companyName: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "100%",
   },
   title: {
      fontWeight: 600,
      ...getMaxLineStyles(2),
   },
   summary: {
      fontWeight: 400,
      lineHeight: "20px",
      ...getMaxLineStyles(2),
   },
   descriptionWrapper: {
      justifyContent: "space-between",
      alignItems: "flex-start",
      alignSelf: "stretch",
      height: "136px",
   },
   chipsWrapper: {
      display: "flex",
      alignItems: "flex-start",
      alignSelf: "stretch",
      mt: "auto",
   },
   mainAndLowerContentWrapper: {
      borderRadius: (theme) => theme.spacing(2),
      overflow: "hidden",
   },
   selectedWrapper: {
      opacity: 0.5,
      backgroundImage: (theme) =>
         `linear-gradient(0deg, ${alpha(
            theme.palette.common.black,
            0.2
         )}, ${alpha(theme.palette.common.black, 0.1)})`,
   },
   mainContentWrapper: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      overflow: "hidden",
      width: "100%",
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
      background:
         "linear-gradient(white, white) padding-box, linear-gradient(180deg, #e9911d, #dc2743 50%, #e9911d) border-box",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%, 100% 200%",
      backgroundPosition: "0 0, 0 100%",
      border: "4px solid transparent",
      animation: `${gradientAnimation} 1s infinite alternate`,
      maxHeight: 347,
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
      border: "none !important",
      width: "56px",
      height: "64px",
      padding: "12px",
      gap: "-4px",
      flexShrink: 0,
      borderRadius: "0px 0px 6px 6px",
      boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
      position: "absolute",
      marginRight: "12px",
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
   cardWrapper: (theme) => ({
      minWidth: "300px",
      height: "100%",
      borderRadius: theme.spacing(2),
      border: `1px solid ${theme.palette.secondary[50]}`,
      background: theme.brand.white[50],
      "& .backgroundImage": {
         transition: theme.transitions.create(["transform"]),
      },
      "&:hover, &:focus-within": {
         "& .backgroundImage": {
            transform: "scale(1.1)",
         },
         background: theme.brand.white[100],
         borderColor: theme.palette.secondary[100],
         boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
      },
      ".MuiCardActionArea-focusHighlight": {
         background: "transparent",
      },
   }),
   startDay: {
      color: (theme) => theme.palette.primary.main,
      fontWeight: 700,
   },
   startMonth: {
      textAlign: "center",
      fontWeight: "400",
      marginTop: "-4px",
      color: (theme) => theme.palette.neutral[900],
      "&::first-letter": {
         textTransform: "uppercase",
      },
   },
   eventDateWrapper: {
      display: "flex",
      marginY: 1,
      justifyContent: "space-between",
   },
   chip: {
      color: (theme) => theme.palette.neutral[500],
      border: (theme) => `1px solid ${theme.palette.neutral[400]}`,
      height: "unset",
      padding: "4px 8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "4px",
      "& .MuiChip-label": {
         fontSize: 12,
         fontWeight: 400,
         lineHeight: "16px",
         padding: 0,
      },
      "& .MuiChip-icon": {
         margin: 0,
         width: "14px",
         height: "14px",
      },
   },
})
type EventPreviewCardProps = {
   event?: LivestreamEvent
   loading?: boolean
   // Animate the loading animation, defaults to the "wave" prop
   animation?: false | "wave" | "pulse"
   isRecommended?: boolean
   // The index of the event in the list
   index?: number
   // The total number of events in the list
   totalElements?: number
   location?: ImpressionLocation | string
   ref?: React.Ref<HTMLDivElement>
   bottomElement?: React.ReactNode
   // If true, the chip labels will be hidden
   hideChipLabels?: boolean
   disableClick?: boolean
   /* Overrides the default Link click behavior of the card */
   onCardClick?: (e: React.MouseEvent<HTMLElement>) => void
   selectInput?: React.ReactNode
   selected?: boolean
   disableTracking?: boolean
}

type AdditionalProps = {
   hasRegistered: boolean
   isLink: boolean
   hasParticipated: boolean
   cardInViewRef: (node?: Element | null) => void
   isPlaceholderEvent: boolean
}

const CardContent = forwardRef<
   HTMLDivElement,
   EventPreviewCardProps & AdditionalProps
>(
   (
      {
         event,
         loading,
         animation,
         isRecommended,
         totalElements,
         index,
         location = ImpressionLocation.unknown,
         bottomElement,
         hideChipLabels,
         disableClick,
         onCardClick,
         selectInput,
         selected,
         disableTracking,
         isPlaceholderEvent,
         ...props
      },
      ref
   ) => {
      const trackImpressionsRef = useTrackLivestreamImpressions({
         event,
         isRecommended,
         positionInResults: index,
         numberOfResults: totalElements,
         location,
         disableTracking: isPlaceholderEvent || disableTracking,
      })

      const [isPast, setIsPast] = useState(checkIfPast(event))

      const { count: jobsCount } = useCustomJobsCount({
         businessFunctionTagIds: [],
         livestreamId: event?.id,
      })

      const hasJobsToApply = useMemo<boolean>(() => {
         if (loading) return false

         if (jobsCount === 0) return false

         return Boolean(event?.hasJobs || event?.jobs?.length > 0)
      }, [event?.hasJobs, event?.jobs?.length, jobsCount, loading])

      useEffect(() => {
         if (!loading) {
            setIsPast(checkIfPast(event))
         }
         // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [event?.start, loading])

      const startDate = useMemo<Date>(
         () => event?.startDate || event?.start?.toDate?.(),
         [event?.start, event?.startDate]
      )
      const getStartDay = useMemo<number>(() => {
         return new Date(startDate).getDate()
      }, [startDate])

      const getStartMonth = useMemo<string>(() => {
         return DateUtil.getMonth(
            new Date(startDate).getMonth(),
            true
         ).toLowerCase()
      }, [startDate])

      const getPastEventDate = useMemo<string>(
         () => DateUtil.formatDateToString(startDate),
         [startDate]
      )

      const handleDetailsClick = useCallback(
         (e: React.MouseEvent<HTMLElement>) => {
            onCardClick?.(e)
         },
         [onCardClick]
      )

      const isLive = useMemo(
         () => event?.hasStarted && !isPast,
         [event?.hasStarted, isPast]
      )

      return (
         <CardActionArea
            sx={[event && styles.cursorPointer, styles.cardWrapper]}
            ref={(e) => {
               trackImpressionsRef(e)
               props.cardInViewRef(e)
            }}
            onClick={handleDetailsClick}
            data-testid={`livestream-card-${event?.id}`}
            disabled={disableClick || loading}
            disableRipple={!event}
         >
            <Box
               ref={ref}
               sx={[
                  styles.mainAndLowerContentWrapper,
                  selected && styles.selectedWrapper,
                  isLive && styles.cardIsLive,
               ]}
            >
               <Box sx={styles.mainContentWrapper}>
                  {selectInput || null}

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

                  {hideChipLabels || loading ? null : (
                     <EventPreviewCardChipLabels
                        hasParticipated={props.hasParticipated}
                        isPast={isPast}
                        isLive={isLive}
                        hasRegistered={props.hasRegistered}
                        hasJobToApply={hasJobsToApply}
                     />
                  )}

                  {isPlaceholderEvent || isPast || loading ? null : (
                     <Box sx={styles.calendarDate}>
                        <Typography variant={"brandedH3"} sx={styles.startDay}>
                           {getStartDay}
                        </Typography>
                        <Typography variant={"xsmall"} sx={styles.startMonth}>
                           {getStartMonth}
                        </Typography>
                     </Box>
                  )}
                  <Box className="contentWrapper" sx={[styles.contentWrapper]}>
                     <Box sx={styles.headerWrapper}>
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
                           />
                        )}
                        <Box sx={styles.companyNameWrapper}>
                           <Typography variant="small" sx={styles.companyName}>
                              {event?.company}
                           </Typography>
                        </Box>
                     </Box>
                     <Box>
                        {isPast ? (
                           <Box
                              className="hidePastDateOnHover"
                              sx={styles.eventDateWrapper}
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
                        <Stack sx={styles.descriptionWrapper}>
                           <Stack spacing={1}>
                              <Typography
                                 variant={"brandedBody"}
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

                              <Typography
                                 variant={"small"}
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
                           </Stack>

                           <Stack
                              className="chipsWrapper"
                              spacing={1}
                              direction={"row"}
                              sx={styles.chipsWrapper}
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
                                    {event?.language?.code ? (
                                       <WhiteTagChip
                                          icon={<Globe />}
                                          variant="filled"
                                          tooltipText={`This event is in ${event?.language.name}`}
                                          label={event?.language.code.toUpperCase()}
                                          sx={styles.chip}
                                       />
                                    ) : null}
                                    {event?.businessFunctionsTagIds
                                       ?.slice(0, 1)
                                       ?.map((tagId) => (
                                          <WhiteTagChip
                                             key={tagId}
                                             variant="filled"
                                             sx={{
                                                maxWidth:
                                                   event
                                                      ?.businessFunctionsTagIds
                                                      .length > 2
                                                      ? "50%"
                                                      : "80%",
                                                ...styles.chip,
                                             }}
                                             label={TagValuesLookup[tagId]}
                                          />
                                       ))}
                                    {event?.businessFunctionsTagIds?.length >
                                    2 ? (
                                       <WhiteTagChip
                                          variant="filled"
                                          sx={styles.chip}
                                          label={`+ ${
                                             event.businessFunctionsTagIds
                                                .length - 1
                                          }`}
                                       />
                                    ) : null}
                                 </>
                              )}
                           </Stack>
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
      )
   }
)

CardContent.displayName = "CardContent"

const EventPreviewCard = forwardRef<HTMLDivElement, EventPreviewCardProps>(
   (props, ref) => {
      const router = useRouter()
      const { pathname } = router

      const { inView: cardInView, ref: cardInViewRef } = useInView({
         fallbackInView: true,
      })

      const hasRegistered = useUserIsRegistered(props.event?.id, {
         disabled: !cardInView, // Helps Reduce the number of listeners
      })

      const hasParticipated = useUserHasParticipated(props.event?.id, {
         disabled: !cardInView, // Helps Reduce the number of listeners
      })

      const isInTalentGuidePage = useIsInTalentGuide()
      const livestreamDialogContext = useLiveStreamDialog()

      const contextProps = useMemo(() => {
         return {
            onClick: () => {
               livestreamDialogContext.handleLiveStreamDialogOpen(
                  props.event.id
               )
            },
         }
      }, [props.event?.id, livestreamDialogContext])

      const { getPartnerEventLink } = usePartnership()

      const isPlaceholderEvent = props.event?.id.includes("placeholderEvent")

      const presenterEvent = useMemo(
         () =>
            props.event
               ? LivestreamPresenter.createFromDocument(props.event)
               : null,
         [props.event]
      )

      const linkProps = useMemo<LinkProps>(() => {
         if (!presenterEvent?.id) {
            return {
               href: "",
            }
         }

         // If the application is running in an iframe, open the link in a new tab with UTM tags
         if (isInIframe()) {
            return {
               href: getPartnerEventLink(presenterEvent.id),
               target: "_blank",
            }
         }

         if (presenterEvent.isLive() && hasRegistered) {
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

         // Fall back to the default portal link and open the event in a new tab
         return {
            href: eventLink,
            target: isOnlivestreamDialogPage(pathname) ? undefined : "_blank",
         }
      }, [presenterEvent, hasRegistered, router, pathname, getPartnerEventLink])

      const isLink =
         !isInTalentGuidePage &&
         props.event &&
         !props.onCardClick &&
         !isPlaceholderEvent

      const additionalProps: AdditionalProps = {
         hasRegistered,
         isLink,
         hasParticipated,
         cardInViewRef,
         isPlaceholderEvent,
      }

      if (isLink) {
         return (
            <Link {...linkProps} shallow scroll={false}>
               <CardContent {...props} {...additionalProps} ref={ref} />
            </Link>
         )
      }

      return (
         <Box {...(isInTalentGuidePage && contextProps)}>
            <CardContent {...props} {...additionalProps} ref={ref} />
         </Box>
      )
   }
)

EventPreviewCard.displayName = "EventPreviewCard"

export default EventPreviewCard
