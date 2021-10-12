import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import {
   AppBar,
   Box,
   CircularProgress,
   Container,
   Grid,
   Tabs,
   Typography,
} from "@material-ui/core";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import NewStreamModal from "./NewStreamModal";
import { useRouter } from "next/router";
import { repositionElement } from "../../../../helperFunctions/HelperFunctions";
import Tab from "@material-ui/core/Tab";
import Header from "./Header";
import EventsTable from "./EventsTable";

const useStyles = makeStyles((theme) => ({
   root: {
      // height: "inherit",
      // paddingTop: theme.spacing(2),
      // paddingBottom: theme.spacing(2),
      // display: "flex",
      // flexDirection: "column",
   },
   streamCard: {},
   highlighted: {},
   appBar: {
      boxShadow: "none",
      background: theme.palette.common.white,
      borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.3)}`,
   },
   tab: {
      fontWeight: 600,
   },
   indicator: {
      height: theme.spacing(0.8),
      padding: theme.spacing(0, 0.5),
   },
   title: {
      background: theme.palette.common.white,
   },
}));

const EventsOverview = ({ group, typeOfStream, query, isAdmin, isDraft }) => {
   const classes = useStyles();
   const { userData, authenticatedUser } = useAuth();
   const [streams, setStreams] = useState([]);
   const [openNewStreamModal, setOpenNewStreamModal] = useState(false);
   const [tabValue, setTabValue] = useState(0);
   const [fetching, setFetching] = useState(false);
   const [currentStream, setCurrentStream] = useState(null);
   const {
      query: { livestreamId },
   } = useRouter();

   useEffect(() => {
      if (group?.id) {
         setFetching(true);
         const unsubscribe = query(group.id, (querySnapshot) => {
            const streamsData = querySnapshot.docs.map((doc) => ({
               id: doc.id,
               rowId: doc.id,
               date: doc.data().start?.toDate?.(),
               ...doc.data(),
            }));
            if (livestreamId && typeOfStream === "draft") {
               const currentEventsOverview = streamsData.findEventsOverview(
                  (el) => el.id === livestreamId
               );
               if (currentEventsOverview > -1) {
                  if (isTargetDraft(streamsData[currentEventsOverview])) {
                     repositionElement(streamsData, currentEventsOverview, 0);
                  }
               }
            }
            setStreams(streamsData);
            setFetching(false);
         });
         return () => unsubscribe();
      }
   }, [livestreamId, isDraft, tabValue]);

   const handleChange = (event, newValue) => {
      setTabValue(newValue);
   };

   const getDrafts = () => {};

   const handleOpenNewStreamModal = () => {
      setOpenNewStreamModal(true);
   };

   const handleCloseNewStreamModal = () => {
      handleResetCurrentStream();
      setOpenNewStreamModal(false);
   };

   const handleResetCurrentStream = () => {
      setCurrentStream(null);
   };

   const handleEditStream = (streamObj) => {
      if (streamObj) {
         setCurrentStream(streamObj);
         handleOpenNewStreamModal();
      }
   };
   const isTargetDraft = (livestream) =>
      isAdmin && typeOfStream === "draft" && livestream.id === livestreamId;

   // const handleFilter = () => {
   //    const newFilteredStreams = streams?.filter((livestream) => {
   //       return (
   //          livestream.title
   //             .toLowerCase()
   //             .indexOf(searchParams.toLowerCase()) >= 0 ||
   //          livestream.company
   //             .toLowerCase()
   //             .indexOf(searchParams.toLowerCase()) >= 0 ||
   //          livestream.summary
   //             ?.toLowerCase()
   //             .indexOf(searchParams.toLowerCase()) >= 0 ||
   //          // Checks speakers
   //          livestream.speakers.some(
   //             (speaker) =>
   //                speaker.firstName
   //                   .toLowerCase()
   //                   .indexOf(searchParams.toLowerCase()) >= 0 ||
   //                speaker.lastName
   //                   .toLowerCase()
   //                   .indexOf(searchParams.toLowerCase()) >= 0
   //          )
   //       );
   //    });
   // };

   return (
      <Fragment>
         <AppBar className={classes.appBar} position="sticky" color="default">
            <Box className={classes.title}>
               <Header
                  group={group}
                  handleOpenNewStreamModal={handleOpenNewStreamModal}
                  isDraft={isDraft}
               />
            </Box>
            {!isDraft && (
               <Tabs
                  value={tabValue}
                  TabIndicatorProps={{ className: classes.indicator }}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  aria-label="full width tabs example"
               >
                  <Tab className={classes.tab} label="Upcoming" />
                  <Tab className={classes.tab} label="Past" />
               </Tabs>
            )}
         </AppBar>
         <Box className={classes.root}>
            {fetching ? (
               <Box
                  height={150}
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
               >
                  <CircularProgress color="primary" />
               </Box>
            ) : (
               <Box width="100%">
                  <EventsTable streams={streams} />
               </Box>
            )}
            <Box flexGrow={1} />
         </Box>
         <NewStreamModal
            group={group}
            typeOfStream={typeOfStream}
            open={openNewStreamModal}
            handleResetCurrentStream={handleResetCurrentStream}
            currentStream={currentStream}
            onClose={handleCloseNewStreamModal}
         />
      </Fragment>
   );
};

const SearchMessage = ({ message }) => (
   <Grid sm={12} md={12} lg={12} xl={12} item>
      <Typography variant="h4" align="center">
         {message}
      </Typography>
   </Grid>
);

EventsOverview.propTypes = {
   group: PropTypes.object,
   isAdmin: PropTypes.bool,
   query: PropTypes.func.isRequired,
   typeOfStream: PropTypes.string.isRequired,
};

export default EventsOverview;
