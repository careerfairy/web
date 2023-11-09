import PropTypes from "prop-types"
import React, { useMemo } from "react"
import makeStyles from "@mui/styles/makeStyles"
import AutoSizer from "react-virtualized-auto-sizer"
import StreamContainer from "./StreamContainer"
import clsx from "clsx"
import Box from "@mui/material/Box"
import LivestreamPdfViewer from "../../../../util/LivestreamPdfViewer"
import {
   STREAM_ELEMENT_BORDER_RADIUS,
   STREAM_ELEMENT_SPACING,
} from "constants/streams"
import Typography from "@mui/material/Typography"
import { Stack } from "@mui/material"
import dynamic from "next/dynamic"
import { useSelector } from "react-redux"
import { focusModeEnabledSelector } from "../../../../../store/selectors/streamSelectors"
import { focus } from "@testing-library/user-event/dist/focus"
const SynchronisedVideoViewer = dynamic(() =>
   import("../../../../util/SynchronisedVideoViewer")
)

const STREAMS_ROW_HEIGHT = 125
const BANNER_ROW_HEIGHT = 75
const WIDE_SCREEN_ROW_HEIGHT = 180
const useStyles = makeStyles((theme) => ({
   root: {
      flex: 1,
   },
   smallStreamsContainerGridItem: {
      display: "flex",
      height: 0,
      transition: theme.transitions.create(["height"], {
         duration: theme.transitions.duration.standard,
         easing: theme.transitions.easing.easeInOut,
      }),
      padding: theme.spacing(STREAM_ELEMENT_SPACING, STREAM_ELEMENT_SPACING, 0),
   },
   grow: {
      height: STREAMS_ROW_HEIGHT,
      [theme.breakpoints.up("lg")]: {
         height: WIDE_SCREEN_ROW_HEIGHT,
      },
   },
   streamsOverflowWrapper: {
      display: "flex",
      overflowX: "auto",
      // justifyContent: "space-between",
      "&::-webkit-scrollbar": {
         height: 5,
      },
      "&::-webkit-scrollbar-track": {
         background: theme.palette.common.black,
      },
      "&::-webkit-scrollbar-thumb": {
         borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
         background: theme.palette.primary.main,
      },
   },
   smallFlexStream: {
      minWidth: STREAMS_ROW_HEIGHT * 1.7,
      [theme.breakpoints.up("lg")]: {
         minWidth: WIDE_SCREEN_ROW_HEIGHT * 1.5,
      },
      maxWidth: 200,
      paddingTop: 0,
      paddingBottom: 0,
      display: "flex",
      "& > *": {
         overflow: "hidden",
         borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
         boxShadow: theme.shadows[5],
      },
   },
   videoElement: {
      width: "100%",
      height: "100%",
      position: "absolute",
      "& > *": {
         borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
         boxShadow: theme.shadows[5],
      },
   },
   largeAbsoluteStream: {
      position: "absolute",
      zIndex: 1,
      display: "flex",
      left: 0,
      top: ({ showBanner }) => (showBanner ? BANNER_ROW_HEIGHT : 0),
      right: 0,
      "& > *": {
         overflow: "hidden",
         borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
         boxShadow: theme.shadows[5],
      },
      bottom: 0,
      padding: theme.spacing(STREAM_ELEMENT_SPACING),
      marginLeft: "0 !important",
      transition: theme.transitions.create(["top"], {
         duration: theme.transitions.duration.standard,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   largeSquished: {
      top: ({ showBanner }) =>
         STREAMS_ROW_HEIGHT + (showBanner ? BANNER_ROW_HEIGHT : 0),
      [theme.breakpoints.up("lg")]: {
         top: ({ showBanner }) =>
            WIDE_SCREEN_ROW_HEIGHT + (showBanner ? BANNER_ROW_HEIGHT : 0),
      },
   },
}))

const StreamElementWrapper = ({
   children,
   large,
   index,
   squished,
   first,
   handRaiseActive,
}) => {
   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const showBanner = useMemo(
      () => handRaiseActive && !focusModeEnabled,
      [handRaiseActive, focusModeEnabled]
   )
   const classes = useStyles({ showBanner })
   return (
      <Box
         className={clsx({
            [classes.largeSquished]: squished,
            [classes.largeAbsoluteStream]: large,
            [classes.smallFlexStream]: !large,
         })}
         style={{
            order: first ? 0 : large ? undefined : index + 10,
         }}
      >
         {children}
      </Box>
   )
}

const StreamsLayout = ({
   streamData,
   liveSpeakers,
   sharingPdf,
   showMenu,
   livestreamId,
   presenter,
   currentSpeakerId,
   videoMutedBackgroundImg,
   sharingScreen,
   hasManySpeakers,
   sharingVideo,
   streamerId,
   viewer,
   handRaiseActive,
}) => {
   const hasSmallStreams = streamData.length > 1
   const classes = useStyles({ hasSmallStreams })
   const waitingForStreamer = useMemo(
      () => Boolean(!sharingPdf && !streamData.length && !presenter),
      [sharingPdf, streamData?.length, presenter]
   )
   return (
      <AutoSizer>
         {({ height, width }) => (
            <div
               className={classes.root}
               style={{
                  width,
                  height,
               }}
            >
               <div
                  className={clsx(classes.smallStreamsContainerGridItem, {
                     [classes.grow]:
                        hasSmallStreams ||
                        ((sharingPdf || sharingVideo) && streamData.length),
                  })}
               >
                  <Stack
                     sx={{
                        p: 0,
                     }}
                     spacing={STREAM_ELEMENT_SPACING}
                     direction="row"
                     justifyContent="space-between"
                     className={classes.streamsOverflowWrapper}
                     style={{
                        width,
                     }}
                  >
                     <Box
                        sx={{
                           order: 0,
                           ml: "auto !important",
                        }}
                     />
                     {streamData.map((stream, index) => {
                        const isLast = index === streamData.length - 1
                        const isLarge = isLast && !sharingPdf && !sharingVideo
                        return (
                           <StreamElementWrapper
                              index={index}
                              first={
                                 currentSpeakerId === stream.uid &&
                                 (sharingVideo ||
                                    sharingPdf ||
                                    sharingScreen) &&
                                 hasManySpeakers
                              }
                              large={isLarge}
                              key={stream.uid}
                              squished={hasSmallStreams}
                              handRaiseActive={handRaiseActive}
                           >
                              <StreamContainer
                                 stream={stream}
                                 big={isLarge}
                                 livestreamId={livestreamId}
                                 videoMutedBackgroundImg={
                                    videoMutedBackgroundImg
                                 }
                                 liveSpeakers={liveSpeakers}
                              />
                           </StreamElementWrapper>
                        )
                     })}
                     {(sharingPdf || sharingVideo) && (
                        <StreamElementWrapper
                           index={1}
                           large
                           squished={streamData.length}
                           handRaiseActive={handRaiseActive}
                        >
                           {sharingPdf ? (
                              <LivestreamPdfViewer
                                 livestreamId={livestreamId}
                                 presenter={presenter}
                                 showMenu={showMenu}
                              />
                           ) : (
                              <SynchronisedVideoViewer
                                 livestreamId={livestreamId}
                                 streamerId={streamerId}
                                 viewer={viewer}
                              />
                           )}
                        </StreamElementWrapper>
                     )}
                     {waitingForStreamer && (
                        <StreamElementWrapper
                           index={1}
                           large
                           squished={streamData.length}
                        >
                           <Typography
                              variant="h5"
                              style={{ color: "white", margin: "auto" }}
                           >
                              Waiting for streamer
                           </Typography>
                        </StreamElementWrapper>
                     )}
                     <Box
                        sx={{
                           order: 999,
                           mr: "auto !important",
                        }}
                     />
                  </Stack>
               </div>
            </div>
         )}
      </AutoSizer>
   )
}

StreamsLayout.propTypes = {
   streamData: PropTypes.arrayOf(PropTypes.object),
}

export default StreamsLayout
