import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AutoSizer from "react-virtualized-auto-sizer";
import { Item, Row } from "@mui-treasury/components/flex";
import StreamContainer from "./StreamContainer";
import clsx from "clsx";
import Box from "@material-ui/core/Box";

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
      // "& > :first-child": {
      //    marginLeft: "auto",
      //    paddingLeft: 0,
      // },
      // "& > :last-child": {
      //    marginRight: "auto",
      //    paddingRight: 0,
      // },
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
      top: (props) => (props.hasSmallStreams ? STREAMS_ROW_HEIGHT : 0),
      left: 0,
      right: 0,
      bottom: 0,
      padding: theme.spacing(SPACING),
      transition: theme.transitions.create(["top"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
}));

const StreamsLayout = ({ streamData, liveSpeakers, play, unmute , sharingPdf}) => {
   const hasSmallStreams = streamData.length > 1;

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
                     [classes.grow]: hasSmallStreams,
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
                        return (
                           <Item
                              className={clsx({
                                 [classes.largeAbsoluteStream]: isLast,
                                 [classes.smallFlexStream]: !isLast,
                              })}
                              style={{
                                 order: isLast ? undefined : index + 10,
                              }}
                              key={stream.streamId}
                           >
                              <StreamContainer
                                 stream={stream}
                                 big={isLast}
                                 liveSpeakers={liveSpeakers}
                                 play={play}
                                 unmute={unmute}
                              />
                           </Item>
                        );
                     })}
                     <Box order={999} marginRight="auto" />
                  </Row>
               </div>
            </div>
         )}
      </AutoSizer>
   );
};

export default StreamsLayout;

StreamsLayout.propTypes = {
   play: PropTypes.bool,
   unmute: PropTypes.bool,
   streamData: PropTypes.arrayOf(PropTypes.object),
};
