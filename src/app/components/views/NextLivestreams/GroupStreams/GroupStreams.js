import React, { useEffect, useState } from "react";
import { Box, Grid, LinearProgress, Typography } from "@mui/material";
import LazyLoad from "react-lazyload";
import useInfiniteScrollClientWithHandlers from "../../../custom-hook/useInfiniteScrollClientWithHandlers";
import EventPreviewCard from "../../common/stream-cards/EventPreviewCard";
import RegistrationModal from "../../common/registration-modal";
import { useRouter } from "next/router";
import useRegistrationModal from "../../../custom-hook/useRegistrationModal";

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
      // height: gridItemHeight,
      // display: "flex",
   },
   dynamicHeight: {
      // height: "auto",
   },
};

const Wrapper = ({ children, streamId }) => {
   return (
      <LazyLoad
         key={streamId}
         style={{ width: "100%" }}
         height={405}
         debounce={100}
         unmountIfInvisible
         scroll
         offset={[0, 600]}
         placeholder={<EventPreviewCard loading />}
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
   const {
      query: { groupId },
   } = useRouter();
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal();
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
   const renderStreamCards = slicedLivestreams?.map((livestream) => {
      if (livestream) {
         return (
            <Grid
               sx={[styles.streamGridItem, mobile && styles.dynamicHeight]}
               key={livestream.id}
               xs={12}
               md={6}
               lg={6}
               xl={4}
               item
            >
               <Wrapper streamId={livestream.id}>
                  <EventPreviewCard
                     onRegisterClick={handleClickRegister}
                     event={livestream}
                  />
               </Wrapper>
            </Grid>
         );
      }
   });

   return (
      <>
         <Box sx={{ p: { xs: 0, sm: 2 } }}>
            <Grid container spacing={mobile ? 2 : 4}>
               {groupData.id || listenToUpcoming ? (
                  searching ? (
                     <Grid xs={12} item sx={styles.loaderWrapper}>
                        <LinearProgress
                           style={{ width: "80%" }}
                           color="primary"
                        />
                     </Grid>
                  ) : livestreams.length ? (
                     renderStreamCards
                  ) : (
                     <Grid xs={12} item sx={styles.loaderWrapper}>
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
         </Box>
         {joinGroupModalData && (
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               onFinish={handleCloseJoinModal}
               promptOtherEventsOnFinal={!groupId}
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
               targetGroupId={joinGroupModalData?.targetGroupId}
               handleClose={handleCloseJoinModal}
            />
         )}
      </>
   );
};
export default GroupStreams;
