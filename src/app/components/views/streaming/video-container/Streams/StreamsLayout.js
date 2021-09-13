import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import AutoSizer from "react-virtualized-auto-sizer";
import { Item, Row } from "@mui-treasury/components/flex";
import StreamContainer from "./StreamContainer";
import clsx from "clsx";

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
      "& > :first-child": {
         marginLeft: "auto",
         paddingLeft: 0,
      },
      "& > :last-child": {
         marginRight: "auto",
         paddingRight: 0,
      },
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
}));

const StreamsLayout = ({
   streamData: { largeStream, smallStreams },
   liveSpeakers,
   play,
   unmute,
}) => {
   const classes = useStyles();

   const hasSmallStreams = Boolean(smallStreams.length);
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
               <AutoSizer>
                  {({ height, width }) => (
                     <Row
                        p={0}
                        gap={SPACING}
                        className={classes.smallStreamsWrapper}
                        style={{
                           width,
                           height,
                        }}
                     >
                        {smallStreams.map((stream) => (
                           <Item
                              className={classes.smallStreamItem}
                              key={stream.streamId}
                           >
                              <StreamContainer
                                 stream={stream}
                                 liveSpeakers={liveSpeakers}
                                 play={play}
                                 unmute={unmute}
                              />
                           </Item>
                        ))}
                     </Row>
                  )}
               </AutoSizer>
            )}
         </Grid>
         <Grid
            className={clsx(classes.largeStreamContainerGridItem, {
               [classes.squished]: hasSmallStreams,
            })}
            item
            xs={12}
         >
            <StreamContainer
               stream={largeStream}
               big
               play={play}
               unmute={unmute}
               liveSpeakers={liveSpeakers}
            />
         </Grid>
      </Grid>
   );
};

export default StreamsLayout;

StreamsLayout.propTypes = {
   play: PropTypes.bool,
   unmute: PropTypes.bool,
   streamData: PropTypes.shape({
      largeStream: PropTypes.object,
      smallStreams: PropTypes.arrayOf(PropTypes.object),
   }),
};
