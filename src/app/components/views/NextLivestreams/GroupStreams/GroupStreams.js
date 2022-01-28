import React, { useEffect, useState } from "react";
import { withFirebase } from "../../../../context/firebase";
import { Grid, LinearProgress, Typography } from "@mui/material";
import GroupStreamCardV2 from "./groupStreamCard/GroupStreamCardV2";
import LazyLoad from "react-lazyload";
import Spinner from "./groupStreamCard/Spinner";
import { useAuth } from "../../../../HOCs/AuthProvider";
import useInfiniteScrollClientWithHandlers from "../../../custom-hook/useInfiniteScrollClientWithHandlers";

const gridItemHeight = 530;
const styles = {
   root: {
      flex: 1,
      paddingTop: 0,
      display: "flex",
      flexDirection: "column",
   },
   followButton: {
      position: "sticky",
      top: "165px",
      zIndex: 101,
      marginBottom: "14px",
   },
   emptyMessage: {
      maxWidth: "400px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
   },
   loaderWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
   },
   streamGridItem: {
      height: gridItemHeight,
      display: "flex",
   },
   dynamicHeight: {
      height: "auto",
   },
};

const Wrapper = ({ children, streamId }) => {
   return (
      <LazyLoad
         style={{ flex: 1, display: "flex", width: "-webkit-fill-available" }}
         key={streamId}
         height={gridItemHeight}
         // unmountIfInvisible
         scroll
         offset={[0, 0]}
         placeholder={<Spinner />}
      >
         {children}
      </LazyLoad>
   );
};

const GroupStreams = ({
   groupData,
   livestreams,
   mobile,
   searching,
   livestreamId,
   careerCenterId,
   listenToUpcoming,
   selectedOptions,
   isPastLivestreams,
}) => {
   const { userData, authenticatedUser: user } = useAuth();
   const [globalCardHighlighted, setGlobalCardHighlighted] = useState(false);
   const searchedButNoResults =
      selectedOptions?.length && !searching && !livestreams?.length;
   const [slicedLivestreams] = useInfiniteScrollClientWithHandlers(
      livestreams,
      6,
      3
   );

   useEffect(() => {
      if (globalCardHighlighted) {
         setGlobalCardHighlighted(false);
      }
   }, [groupData]);

   const renderStreamCards = slicedLivestreams?.map((livestream, index) => {
      if (livestream) {
         return (
            <Grid
               sx={[styles.streamGridItem, mobile && styles.dynamicHeight]}
               key={livestream.id}
               xs={12}
               sm={12}
               md={6}
               lg={4}
               xl={4}
               item
            >
               <Wrapper index={index} streamId={livestream.id}>
                  <GroupStreamCardV2
                     mobile={mobile}
                     isPastLivestreams={isPastLivestreams}
                     setGlobalCardHighlighted={setGlobalCardHighlighted}
                     globalCardHighlighted={globalCardHighlighted}
                     groupData={groupData}
                     listenToUpcoming={listenToUpcoming}
                     careerCenterId={careerCenterId}
                     livestreamId={livestreamId}
                     user={user}
                     userData={userData}
                     id={livestream.id}
                     key={livestream.id}
                     livestream={livestream}
                  />
               </Wrapper>
            </Grid>
         );
      }
   });

   return (
      <Grid item xs={12}>
         <Grid container spacing={mobile ? 2 : 4}>
            {groupData.id || listenToUpcoming ? (
               searching ? (
                  <Grid md={12} lg={12} xl={12} item sx={styles.loaderWrapper}>
                     <LinearProgress style={{ width: "80%" }} color="primary" />
                  </Grid>
               ) : livestreams.length ? (
                  renderStreamCards
               ) : (
                  <Grid
                     sm={12}
                     xs={12}
                     md={12}
                     lg={12}
                     xl={12}
                     item
                     sx={styles.loaderWrapper}
                  >
                     <Typography
                        sx={styles.emptyMessage}
                        align="center"
                        variant="h5"
                        style={{ marginTop: 100 }}
                     >
                        {searchedButNoResults ? (
                           "We couldn't find anything... 😕"
                        ) : (
                           <strong>
                              {groupData.universityName} currently has no{" "}
                              {isPastLivestreams ? "past" : "scheduled"} live
                              streams
                           </strong>
                        )}
                     </Typography>
                  </Grid>
               )
            ) : null}
         </Grid>
      </Grid>
   );
};
export default withFirebase(GroupStreams);
