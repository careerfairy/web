import React, {
   forwardRef,
   memo,
   useCallback,
   useEffect,
   useState,
} from "react"
import cx from "clsx"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import CardMedia from "@mui/material/CardMedia"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import {
   Button,
   Slide,
   Stack,
   Tooltip,
   Typography,
   useMediaQuery,
} from "@mui/material"
import { AvatarGroup } from "@mui/material"
import { MainLogo } from "../../../logos"
import RegisterIcon from "@mui/icons-material/AddToPhotosRounded"
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks"
import EmbedTimeDisplay from "../time-display/EmbedTimeDisplay"
import MobileCarousel from "../carousels/MobileCarousel"
import useTrackLivestreamImpressions from "../../../custom-hook/useTrackLivestreamImpressions"
import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import {
   makeLivestreamEventDetailsUrl,
   makeLivestreamGroupEventDetailsUrl,
} from "@careerfairy/shared-lib/src/utils/urls"

const useStyles = makeStyles((theme) => ({
   // @ts-ignore
   color: ({ color }) => ({
      "&:before": {
         backgroundColor: color,
      },
   }),
   root: {
      position: "relative",
      borderRadius: "1rem",
      "&:before": {
         transition: "0.2s",
         position: "absolute",
         width: "100%",
         height: "100%",
         content: '""',
         display: "block",
         borderRadius: "1rem",
         zIndex: 0,
         bottom: 0,
      },
      "&:hover": {
         "&:before": {
            bottom: -6,
         },
         "& $logo": {
            transform: "scale(1.1)",
            boxShadow: "0 6px 20px 0 rgba(0,0,0,0.38)",
         },
      },
   },
   cover: {
      borderRadius: "1rem",
      "&:before": {
         content: '""',
         borderRadius: "1rem",
         position: "absolute",
         left: "0",
         right: "0",
         top: "0",
         bottom: "0",
         background: alpha(theme.palette.common.black, 0.7),
      },
   },
   graphicHovered: {
      backgroundColor: `${theme.palette.primary.main} !important`,
   },
   graphic: {
      transition: theme.transitions.create(["background-color"], {
         easing: theme.transitions.easing.easeInOut,
         duration: theme.transitions.duration.standard,
      }),
      content: '""',
      display: "inline-block",
      position: "absolute",
      left: 0,
      top: 0,
      zIndex: 0,
      width: "100%",
      height: "100%",
      clipPath:
         "polygon(0% 100%, 0% 35%, 0.3% 33%, 1% 31%, 1.5% 30%, 2% 29%, 2.5% 28.4%, 3% 27.9%, 3.3% 27.6%, 5% 27%,95% 0%,100% 0%, 100% 100%)",
      borderRadius: "1rem",
      // backgroundColor: alpha(theme.palette.common.black, 0.4),
      //   backdropFilter: "blur(5px)",
   },
   content: {
      position: "relative",
      zIndex: 1,
      borderRadius: "1rem",
      "&:before": {},
   },
   title: {
      fontSize: "1.25rem",
      fontWeight: 500,
      color: theme.palette.common.white,
      margin: 0,
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 2,
      WebkitLineClamp: 2,
      wordBreak: "break-word",
      overflow: "hidden",
   },
   logo: {
      transition: `${theme.transitions.duration.standard}ms`,
      width: 70,
      height: 70,
      boxShadow: "0 4px 12px 0 rgba(0,0,0,0.24)",
      borderRadius: "1rem",
      background: theme.palette.common.white,
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
      },
   },
   miniAvatar: {
      height: 50,
      width: 50,
      boxShadow: theme.shadows[10],
   },
   team: {
      fontSize: "0.75rem",
   },
   date: {
      color: theme.palette.common.white,
      // @ts-ignore
      backgroundColor: ({ color }) => color,
      opacity: 1,
      fontSize: "1rem",
      padding: "0.5rem",
      borderRadius: 12,
      border: "2px solid rgba(255,255,255, 1)",
   },
   careerFairyLogo: {
      width: 80,
   },
   carouselWrapper: {
      zIndex: 1,
      height: 100,
      width: "calc(100% - 72px)",
      display: "flex",
      alignItems: "flex-end",
   },
}))

type CustomCardProps = {
   classes?: any
   cover: string
   logo: string
   title: string
   brand: React.ReactNode
   date?: Date
   speakers: any
   handleMouseEnter: () => void
   handleMouseLeave: () => void
   isPast: boolean
   logoTooltip: string
   showCarousel: boolean
   actionLink: string
}
const CustomCard = forwardRef(function CustomCard(
   {
      classes,
      cover,
      logo,
      title,
      brand,
      date,
      speakers,
      handleMouseEnter,
      handleMouseLeave,
      isPast,
      logoTooltip,
      showCarousel,
      actionLink,
   }: CustomCardProps,
   ref
) {
   return (
      <Box
         ref={ref}
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         className={cx(classes.root, classes.color)}
      >
         <Box
            position="absolute"
            sx={{
               position: "absolute",
               zIndex: 2,
               top: "10px",
               right: "10px",
            }}
         >
            <EmbedTimeDisplay date={date} />
         </Box>
         <CardMedia
            sx={{
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               zIndex: 0,
               position: "absolute",
               backgroundColor: "rgba(0, 0, 0, 0.08)",
               backgroundPosition: "center center",
            }}
            image={cover}
            className={classes.cover}
         />
         <Box
            style={{
               paddingLeft: 20,
               overflow: "hidden",
            }}
            height={100}
            display="flex"
            alignItems="flex-end"
            position="relative"
         >
            <Box position="absolute" className={classes.carouselWrapper}>
               <Slide
                  direction="left"
                  in={showCarousel}
                  mountOnEnter
                  unmountOnExit
               >
                  <span>
                     <MobileCarousel data={speakers} />
                  </span>
               </Slide>
            </Box>
            <Slide
               direction="right"
               in={!showCarousel}
               mountOnEnter
               unmountOnExit
            >
               <AvatarGroup max={4}>
                  {speakers.map((speaker, index) => (
                     <Avatar
                        key={`${speaker.imgPath}-${index}`}
                        className={classes.miniAvatar}
                        alt={`${speaker.label}'s photo`}
                        src={speaker.imgPath}
                     />
                  ))}
               </AvatarGroup>
            </Slide>
         </Box>
         <Box className={classes.content} p={2}>
            <div className={classes.graphic} />
            <Box position={"relative"} zIndex={1}>
               <Stack
                  sx={{ alignItems: "center", p: 1 }}
                  direction="row"
                  spacing={2}
               >
                  <Box>
                     <Tooltip title={logoTooltip}>
                        <Avatar className={classes.logo} src={logo} />
                     </Tooltip>
                  </Box>
                  <Box>
                     <Tooltip title={title}>
                        <Typography variant="h2" className={classes.title}>
                           {title}
                        </Typography>
                     </Tooltip>
                  </Box>
               </Stack>
               <Stack
                  justifyContent="space-between"
                  direction="row"
                  sx={{
                     alignItems: "center",
                     mt: 4,
                     p: 1,
                  }}
               >
                  <Box>
                     <div className={classes.team}>{brand}</div>
                  </Box>
                  <Box>
                     <Button
                        startIcon={
                           isPast ? <LibraryBooksIcon /> : <RegisterIcon />
                        }
                        variant={"contained"}
                        href={actionLink}
                        target="_blank"
                        size="small"
                        color={isPast ? "secondary" : "primary"}
                     >
                        {isPast ? "Details" : "Register"}
                     </Button>
                  </Box>
               </Stack>
            </Box>
         </Box>
      </Box>
   )
})

type Props = {
   stream: LivestreamEvent
   isPast: boolean
   currentGroup: Group
   index: number
   totalElements: number
   location: ImpressionLocation
}

const EmbedStreamCard = ({
   stream,
   isPast,
   currentGroup,
   index,
   totalElements,
   location,
}: Props) => {
   const ref = useTrackLivestreamImpressions({
      event: stream,
      positionInResults: index,
      numberOfResults: totalElements,
      location,
   })

   const {
      palette: { primary, secondary },
      breakpoints,
   } = useTheme()
   const mobile = useMediaQuery(breakpoints.down("sm"))

   const [hovered, setHovered] = useState(false)

   const [speakers, setSpeakers] = useState([])
   const [showCarousel, setShowCarousel] = useState(false)
   const classes = useStyles({
      color: isPast ? secondary.main : primary.dark,
      hovered,
   })

   const handleMouseEnter = useCallback(() => setHovered(true), [])
   const handleMouseLeave = useCallback(() => setHovered(false), [])

   const getStreamLink = useCallback((groupId, streamId) => {
      if (groupId) {
         return makeLivestreamGroupEventDetailsUrl(groupId, streamId)
      } else {
         return makeLivestreamEventDetailsUrl(streamId)
      }
   }, [])

   useEffect(() => {
      const newSpeakers = stream.speakers?.map((speaker) => ({
         label: `${speaker.firstName} ${speaker.lastName}`,
         imgPath: getResizedUrl(speaker.avatar, "sm"),
         subLabel: `${speaker.position}`,
      }))
      setSpeakers(newSpeakers || [])
   }, [stream?.speakers])

   useEffect(() => {
      setShowCarousel(Boolean(hovered && !mobile))
   }, [speakers, mobile, hovered])

   return (
      <CustomCard
         ref={ref}
         classes={classes}
         showCarousel={showCarousel}
         handleMouseEnter={handleMouseEnter}
         handleMouseLeave={handleMouseLeave}
         speakers={speakers}
         isPast={isPast}
         actionLink={getStreamLink(currentGroup.id, stream.id)}
         logoTooltip={stream.company}
         brand={<MainLogo white className={classes.careerFairyLogo} />}
         date={stream.startDate || stream.start.toDate()}
         cover={getResizedUrl(stream.backgroundImageUrl, "md")}
         logo={getResizedUrl(stream.companyLogoUrl, "xs")}
         title={stream.title}
      />
   )
}
export default memo(EmbedStreamCard)
