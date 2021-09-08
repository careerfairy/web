import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper } from "@material-ui/core";
import AutoSizer from "react-virtualized-auto-sizer";
import { Item, Row } from "@mui-treasury/components/flex";

const useStyles = makeStyles((theme) => ({
   root: {
      padding: theme.spacing(2),
   },
   smallStreamsContainerGridItem: {
      height: 180,
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
   },
   smallStreamItem: {
      minWidth: 180,
      // maxWidth: 200,
      flexGrow: 1,
      paddingTop: 0,
      paddingBottom: 0,
   },
}));

const StreamsLayout = ({ streamData: { largeStream, smallStreams } }) => {
   const classes = useStyles();

   return (
      <Grid className={classes.root} container spacing={2}>
         {smallStreams.length && (
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
                                 <Paper
                                    style={{
                                       height: "100%",
                                    }}
                                 >
                                    Stream - {index}
                                 </Paper>
                              </Item>
                           )
                        )}
                     </Row>
                  )}
               </AutoSizer>
            </Grid>
         )}
         <Grid item xs={12}>
            <Paper>large - {largeStream?.streamId}</Paper>
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
