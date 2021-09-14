import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import AutoSizer from "react-virtualized-auto-sizer";
import { Item, Row } from "@mui-treasury/components/flex";
import StreamContainer from "./StreamContainer";
import clsx from "clsx";
import Box from "@material-ui/core/Box";
import { useMeasure } from "react-use";

const SPACING = 1;

const useStyles = makeStyles((theme) => ({
   root: {
      padding: theme.spacing(SPACING),
      flex: 1,
   },
   smallStreamsContainerGridItem: {
      display: "flex",
      height: 0,
      transition: theme.transitions.create(["height"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   grow: {
      height: "20%",
   },
   largeStreamContainerGridItem: {
      height: "100%",
      display: "flex",
      flex: 1,
      transition: theme.transitions.create(["height"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   squished: {
      height: "80%",
   },
   smallStreamsWrapper: {
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
   smallStreamItem: {
      minWidth: 180,
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
      top: "20%",
      left: 0,
      right: 0,
      bottom: 0,
      padding: theme.spacing(SPACING),
   },
}));

const StreamsLayout = ({ streamData, liveSpeakers, play, unmute }) => {
   const classes = useStyles();

   const hasSmallStreams = true;
   return (
      <Grid className={classes.root} container spacing={SPACING}>
         <Grid
            className={clsx(classes.smallStreamsContainerGridItem, {
               [classes.grow]: hasSmallStreams,
            })}
            style={{ padding: !hasSmallStreams && 0 }}
            item
            xs={12}
         >
            {hasSmallStreams && (
               <Row
                  p={0}
                  gap={SPACING}
                  className={classes.smallStreamsWrapper}
                  // style={{
                  //    width,
                  //    height
                  // }}
               >
                  {/*<Box order={0} marginLeft="auto" />*/}
                  {streamData.map((stream, index) => {
                     const isLast = index === streamData.length - 1;

                     return (
                        <Item
                           className={clsx({
                              [classes.largeAbsoluteStream]: isLast,
                              [classes.smallStreamItem]: !isLast,
                           })}
                           big={isLast}
                           style={{
                              order: isLast ? undefined : index + 10,
                           }}
                           key={stream.streamId}
                        >
                           <StreamContainer
                              stream={stream}
                              liveSpeakers={liveSpeakers}
                              play={play}
                              unmute={unmute}
                           />
                        </Item>
                     );
                  })}
                  {/*<Box order={999} marginRight="auto" />*/}
               </Row>
            )}
         </Grid>
      </Grid>
   );
};

export default StreamsLayout;

StreamsLayout.propTypes = {
   play: PropTypes.bool,
   unmute: PropTypes.bool,
   streamData: PropTypes.arrayOf(PropTypes.object),
};
