import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useFirebase } from "context/firebase";
import { Box, Container, Typography } from "@material-ui/core";
import UpcomingLivestreamsCarousel from "../../../landing/UpcomingLivestreamsSection/UpcomingLivestreamsCarousel";
import { getMaxSlides } from "util/CommonUtil";
import RegistrationModal from "../../../common/registration-modal";

const useStyles = makeStyles((theme) => ({
   root: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor:
         theme.palette.type === "dark"
            ? theme.palette.common.black
            : theme.palette.background.paper,
      zIndex: 999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      flexDirection: "column",
   },
   carouselWrapper: {
      display: "flex",
      width: "100%",
   },
}));
const RecommendedEventsOverlay = ({ recommendedEventIds, mobile }) => {
   const classes = useStyles();
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined);
   const handleCloseJoinModal = useCallback(
      () => setJoinGroupModalData(undefined),
      []
   );
   const handleOpenJoinModal = (dataObj) =>
      setJoinGroupModalData({
         groups: dataObj.groups,
         livestream: dataObj.livestream,
      });
   const { listenToRecommendedEvents } = useFirebase();
   const [recommendedEvents, setRecommendedEvents] = useState([]);

   useEffect(() => {
      if (recommendedEventIds?.length) {
         const unsubscribe = listenToRecommendedEvents(
            recommendedEventIds,
            (querySnapshot) => {
               const newRecommendedEvents = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }));
               setRecommendedEvents(newRecommendedEvents);
            }
         );
         return () => unsubscribe();
      }
   }, [recommendedEventIds]);

   const additionalSettings = {
      slidesToShow: getMaxSlides(3, recommendedEvents.length),
      slidesToScroll: getMaxSlides(3, recommendedEvents.length),
      responsive: [
         {
            breakpoint: 1400,
            settings: {
               slidesToShow: getMaxSlides(2, recommendedEvents.length),
               slidesToScroll: getMaxSlides(2, recommendedEvents.length),
               infinite: true,
            },
         },
         {
            breakpoint: 1024,
            settings: {
               slidesToShow: getMaxSlides(1, recommendedEvents.length),
               slidesToScroll: getMaxSlides(1, recommendedEvents.length),
               dots: true,
               infinite: true,
            },
         },
         {
            breakpoint: 600,
            settings: {
               slidesToShow: 1,
               dots: true,
               slidesToScroll: 1,
            },
         },
      ],
   };

   return (
      <div className={classes.root}>
         {!mobile && (
            <Box p={1}>
               <Typography variant="h4">COMING UP NEXT...</Typography>
            </Box>
         )}
         <Container maxWidth="lg" className={classes.carouselWrapper}>
            <UpcomingLivestreamsCarousel
               handleOpenJoinModal={handleOpenJoinModal}
               upcomingStreams={recommendedEvents}
               additionalSettings={additionalSettings}
               disableAutoPlay={Boolean(joinGroupModalData)}
            />
         </Container>
         <RegistrationModal
            open={Boolean(joinGroupModalData)}
            handleClose={handleCloseJoinModal}
            livestream={joinGroupModalData?.livestream}
            groups={joinGroupModalData?.groups}
         />
      </div>
   );
};

export default RecommendedEventsOverlay;
