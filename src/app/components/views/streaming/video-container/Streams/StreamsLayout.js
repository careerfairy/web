import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AutoSizer from "react-virtualized-auto-sizer";
import { Item, Row } from "@mui-treasury/components/flex";
import StreamContainer from "./StreamContainer";
import clsx from "clsx";
import Box from "@material-ui/core/Box";
import LivestreamPdfViewer from "../../../../util/LivestreamPdfViewer";

const SPACING = 1;
const STREAMS_ROW_HEIGHT = 180;
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
      padding: theme.spacing(SPACING, SPACING, 0),
   },
   grow: {
      height: STREAMS_ROW_HEIGHT,
   },
   streamsOverflowWrapper: {
      display: "flex",
      overflowX: "auto",
      justifyContent: "space-between",
      "&::-webkit-scrollbar": {
         height: 5,
      },
      "&::-webkit-scrollbar-track": {
         background: theme.palette.common.black,
      },
      "&::-webkit-scrollbar-thumb": {
         borderRadius: 10,
         background: theme.palette.primary.main,
      },
   },
   smallFlexStream: {
      minWidth: STREAMS_ROW_HEIGHT,
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
         borderRadius: 10,
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
      padding: theme.spacing(SPACING),
      transition: theme.transitions.create(["top"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   largeSquished: {
      top: STREAMS_ROW_HEIGHT,
   },
}));

const StreamElementWrapper = ({ children, large, index, squished, first }) => {
   const classes = useStyles();
   return (
      <Item
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
      </Item>
   );
};

const StreamsLayout = ({
   streamData,
   liveSpeakers,
   play,
   unmute,
   sharingPdf,
   showMenu,
   livestreamId,
   presenter,
   currentSpeakerId,
}) => {
   const hasSmallStreams = streamData.length > 1;
   console.log("-> streamData", streamData);
   const classes = useStyles({ hasSmallStreams });

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
                  <Row
                     p={0}
                     gap={SPACING}
                     className={classes.streamsOverflowWrapper}
                     style={{
                        width,
                     }}
                  >
                     <Box order={0} marginLeft="auto" />
                     {streamData.map((stream, index) => {
                        const isLast = index === streamData.length - 1;
                        const isLarge = isLast && !sharingPdf;
                        return (
                           <StreamElementWrapper
                              index={index}
                              first={
                                 currentSpeakerId === stream.streamId &&
                                 sharingPdf
                              }
                              large={isLarge}
                              key={stream.streamId}
                              squished={hasSmallStreams}
                           >
                              <StreamContainer
                                 stream={stream}
                                 big={isLarge}
                                 liveSpeakers={liveSpeakers}
                                 play={play}
                                 unmute={unmute}
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
                     <Box order={999} marginRight="auto" />
                  </Row>
               </div>
            </div>
         )}
      </AutoSizer>
   );
};

StreamsLayout.propTypes = {
   play: PropTypes.bool,
   unmute: PropTypes.bool,
   streamData: PropTypes.arrayOf(PropTypes.object),
};

export default StreamsLayout;

