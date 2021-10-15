import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { AppBar, Box, CircularProgress, Grid, Tabs } from "@material-ui/core";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import NewStreamModal from "./NewStreamModal";
import { useRouter } from "next/router";
import { repositionElement } from "../../../../helperFunctions/HelperFunctions";
import Tab from "@material-ui/core/Tab";
import Header from "./Header";
import EventsTable from "./events-table/EventsTable";
import { useFirebase } from "context/firebase";

const useStyles = makeStyles((theme) => ({
   containerRoot: {
      padding: theme.spacing(3),
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

const EventsOverview = ({ group }) => {
   const classes = useStyles();
   const { userData, authenticatedUser } = useAuth();
   const {
      listenToDraftLiveStreamsByGroupId,
      listenToUpcomingLiveStreamsByGroupId,
      listenToPastLiveStreamsByGroupId,
      findTargetEvent,
   } = useFirebase();
   const [streams, setStreams] = useState([]);
   const [openNewStreamModal, setOpenNewStreamModal] = useState(false);
   const [tabValue, setTabValue] = useState("upcoming");
   const [fetching, setFetching] = useState(false);
   const [currentStream, setCurrentStream] = useState(null);
   const [fetchingQueryEvent, setFetchingQueryEvent] = useState(false);

   const {
      query: { eventId },
   } = useRouter();

   useEffect(() => {
      if (group?.id) {
         let query;
         if (tabValue === "upcoming") {
            query = listenToUpcomingLiveStreamsByGroupId;
         } else if (tabValue === "past") {
            query = listenToPastLiveStreamsByGroupId;
         } else {
            query = listenToDraftLiveStreamsByGroupId;
         }
         setFetching(true);
         const unsubscribe = query(group.id, (querySnapshot) => {
            const streamsData = querySnapshot.docs.map((doc) => ({
               id: doc.id,
               rowId: doc.id,
               rowID: doc.id,
               date: doc.data().start?.toDate?.(),
               ...doc.data(),
            }));
            if (eventId) {
               const queryEventIndex = streamsData.findIndex(
                  (el) => el.id === eventId
               );
               if (queryEventIndex > -1) {
                  repositionElement(streamsData, queryEventIndex, 0);
               }
            }
            setStreams(streamsData);
            setFetching(false);
         });
         return () => unsubscribe();
      }
   }, [tabValue]);

   useEffect(() => {
      if (eventId) {
         (async function getQueryEvent() {
            try {
               setFetchingQueryEvent(true);
               const { targetStream, typeOfStream } = await findTargetEvent(
                  eventId
               );
               if (typeOfStream && targetStream) {
                  setTabValue(typeOfStream);
               }
            } catch (e) {}
            setFetchingQueryEvent(false);
         })();
      }
   }, [eventId]);

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

   return (
      <Fragment>
         <AppBar className={classes.appBar} position="sticky" color="default">
            <Box className={classes.title}>
               <Header
                  group={group}
                  handleOpenNewStreamModal={handleOpenNewStreamModal}
                  isDraft={tabValue === "draft"}
               />
            </Box>
            <Tabs
               value={tabValue}
               TabIndicatorProps={{ className: classes.indicator }}
               onChange={handleChange}
               indicatorColor="primary"
               textColor="primary"
               aria-label="full width tabs example"
            >
               <Tab className={classes.tab} label="Upcoming" value="upcoming" />
               <Tab className={classes.tab} label="Past" value="past" />
               <Tab className={classes.tab} label="Drafts" value="drafts" />
            </Tabs>
         </AppBar>
         <Grid className={classes.containerRoot} container spacing={3}>
            <Grid xs={12} item>
               <Box>
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
                        <EventsTable
                           handleEditStream={handleEditStream}
                           isDraft={tabValue === "draft"}
                           streams={streams}
                           disabled={fetchingQueryEvent || fetching}
                        />
                     </Box>
                  )}
                  <Box flexGrow={1} />
               </Box>
            </Grid>
         </Grid>
         <NewStreamModal
            group={group}
            typeOfStream={tabValue}
            open={openNewStreamModal}
            handleResetCurrentStream={handleResetCurrentStream}
            currentStream={currentStream}
            onClose={handleCloseNewStreamModal}
         />
      </Fragment>
   );
};

EventsOverview.propTypes = {
   group: PropTypes.object,
   isAdmin: PropTypes.bool,
};

export default EventsOverview;
