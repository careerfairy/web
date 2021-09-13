import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import AutoSizer from "react-virtualized-auto-sizer";
import { Item, Row } from "@mui-treasury/components/flex";
import StreamContainer from "./StreamContainer";

const SPACING = 1;

const useStyles = makeStyles((theme) => ({
   root: {
      padding: theme.spacing(SPACING),
      flex: 1,
   },
   smallStreamsContainerGridItem: {
      // height: 180,
      display: "flex",
      height: "20%",
   },
   largeStreamContainerGridItem: {
      height: "80%",
      display: "flex",
      flex: 1
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
}));

const StreamsLayout = ({
   streamData: { largeStream, smallStreams },
   liveSpeakers,
}) => {
   const classes = useStyles();
   // console.log("-> largeStream", largeStream);
   // console.log("-> smallStreams", smallStreams);

   const hasSmallStreams = Boolean(smallStreams.length)
   return (
      <Grid className={classes.root} container spacing={SPACING}>
         { hasSmallStreams && (
            <Grid
               className={classes.smallStreamsContainerGridItem}
               item
               xs={12}
            >
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
                        {smallStreams.map(
                           // {[...smallStreams, ...smallStreams].map(
                           (stream) => (
                              <Item
                                 className={classes.smallStreamItem}
                                 // key={`${stream.streamId}-${index}`}
                                 key={stream.streamId}
                              >
                                 <StreamContainer
                                    stream={stream}
                                    liveSpeakers={liveSpeakers}
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
            <StreamContainer
               stream={largeStream}
               big
               liveSpeakers={liveSpeakers}
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
