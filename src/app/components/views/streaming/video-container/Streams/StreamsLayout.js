import PropTypes from "prop-types";
import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import AutoSizer from "react-virtualized-auto-sizer";
import { Item, Row } from "@mui-treasury/components/flex";
import StreamContainer from "./StreamContainer";
import clsx from "clsx";
import Box from "@mui/material/Box";
import LivestreamPdfViewer from "../../../../util/LivestreamPdfViewer";
import {
   STREAM_ELEMENT_BORDER_RADIUS,
   STREAM_ELEMENT_SPACING,
} from "constants/streams";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";

const STREAMS_ROW_HEIGHT = 125;
const WIDE_SCREEN_ROW_HEIGHT = 180;
const useStyles = makeStyles((theme) => ({
   root: {
      flex: 1,
   },
   smallStreamsContainerGridItem: {
      display: "flex",
      height: 0,
      transition: theme.transitions.create(["height"], {
         duration: theme.transitions.duration.complex,
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
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: theme.spacing(STREAM_ELEMENT_SPACING),
      transition: theme.transitions.create(["top"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   largeSquished: {
      top: STREAMS_ROW_HEIGHT,
      [theme.breakpoints.up("lg")]: {
         top: WIDE_SCREEN_ROW_HEIGHT,
      },
   },
}));

const StreamElementWrapper = ({ children, large, index, squished, first }) => {
   const classes = useStyles();
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
   );
};

const StreamsLayout = ({
   streamData,
   liveSpeakers,
   setRemovedStream,
   sharingPdf,
   showMenu,
   livestreamId,
   presenter,
   currentSpeakerId,
   videoMutedBackgroundImg,
   sharingScreen,
   hasManySpeakers,
}) => {
   const hasSmallStreams = streamData.length > 1;
   const classes = useStyles({ hasSmallStreams });
   const waitingForStreamer = useMemo(
      () => Boolean(!sharingPdf && !streamData.length && !presenter),
      [sharingPdf, streamData?.length, presenter]
   );
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
                        hasSmallStreams || (sharingPdf && streamData.length),
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
                        const isLast = index === streamData.length - 1;
                        const isLarge = isLast && !sharingPdf;
                        return (
                           <StreamElementWrapper
                              index={index}
                              first={
                                 currentSpeakerId === stream.streamId &&
                                 (sharingPdf || sharingScreen) &&
                                 hasManySpeakers
                              }
                              large={isLarge}
                              key={stream.streamId}
                              squished={hasSmallStreams}
                           >
                              <StreamContainer
                                 stream={stream}
                                 big={isLarge}
                                 livestreamId={livestreamId}
                                 videoMutedBackgroundImg={
                                    videoMutedBackgroundImg
                                 }
                                 setRemovedStream={setRemovedStream}
                                 liveSpeakers={liveSpeakers}
                              />
                           </StreamElementWrapper>
                        );
                     })}
                     {sharingPdf && (
                        <StreamElementWrapper
                           index={1}
                           large
                           squished={streamData.length}
                        >
                           <LivestreamPdfViewer
                              livestreamId={livestreamId}
                              presenter={presenter}
                              showMenu={showMenu}
                           />
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
   );
};

StreamsLayout.propTypes = {
   streamData: PropTypes.arrayOf(PropTypes.object),
};

export default StreamsLayout;
