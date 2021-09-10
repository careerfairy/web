import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper } from "@material-ui/core";
import AutoSizer from "react-virtualized-auto-sizer";
import { Item, Row } from "@mui-treasury/components/flex";
import StreamItem from "./StreamItem";

const useStyles = makeStyles((theme) => ({
   root: {
      padding: theme.spacing(2),
      flex: 1
   },
   smallStreamsContainerGridItem: {
      // height: 180,
      display: "flex",
      height: "20%"
   },
   largeStreamContainerGridItem: {
      height: "80%",
      display: "flex",
   },
   smallStreamsWrapper: {
      display: "flex",
      overflowX: "auto",
      justifyContent: "space-between",
      "& > :first-child": {
         marginLeft: "auto",
         paddingLeft: 0
      },
      "& > :last-child": {
         marginRight: "auto",
         paddingRight: 0
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
      // flexGrow: 1,
      paddingTop: 0,
      paddingBottom: 0,
      display: "flex",
   },
}));

const StreamsLayout = ({ streamData: { largeStream, smallStreams } }) => {
   const classes = useStyles();
   console.log("-> largeStream", largeStream);
   console.log("-> smallStreams", smallStreams);
   return (
      <Grid className={classes.root} container spacing={2}>
         {Boolean(smallStreams.length) && (
            <Grid
               className={classes.smallStreamsContainerGridItem}
               item
               xs={12}
            >
               <AutoSizer>
                  {({ height, width }) => (
                     <Row
                        p={0}
                        gap={2}
                        className={classes.smallStreamsWrapper}
                        style={{
                           width,
                           height,
                        }}
                     >
                        {[...smallStreams, ...smallStreams].map(
                           (stream, index) => (
                              <Item
                                 className={classes.smallStreamItem}
                                 key={`${stream.streamId}-${index}`}
                              >
                                 <StreamItem
                                   stream={stream}
                                   videoId={stream.isLocal? "localVideo": stream.streamId}
                                 />
                              </Item>
                           )
                        )}
                     </Row>
                  )}
               </AutoSizer>
            </Grid>
         )}
         <Grid className={classes.largeStreamContainerGridItem} item xs={12}>
            <StreamItem
              stream={largeStream}
              videoId={(largeStream?.isLocal || !largeStream)? "localVideo": largeStream?.streamId}
              big
            />
         </Grid>
      </Grid>
   );
};

export default StreamsLayout;

StreamsLayout.propTypes = {
   streamData: PropTypes.shape({
      largeStream: PropTypes.object,
      smallStreams: PropTypes.arrayOf(PropTypes.object),
   }),
};
