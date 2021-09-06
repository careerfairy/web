import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import { AppBar, Box, IconButton, Tab, Tabs } from "@material-ui/core";
import SwipeableViews from "react-swipeable-views";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { SwipeablePanel } from "../../../../materialUI/GlobalPanels/GlobalPanels";
import BreakdownTab from "./BreakdownTab";
import { withFirebase } from "../../../../context/firebase";
import { useCurrentStream } from "../../../../context/stream/StreamContext";
import PeopleWhoJoinedTab from "./PeopleWhoJoinedTab";
import useStreamRef from "../../../custom-hook/useStreamRef";

const useStyles = makeStyles((theme) => ({
   drawerContent: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.down("sm")]: {
         width: "100vw",
      },
      [theme.breakpoints.up("sm")]: {
         width: 400,
      },
   },
   panel: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      overflowX: "hidden",
   },
   audienceAppBar: {
      flexDirection: "row",
   },
   audienceTabs: {
      flex: 1,
   },
}));

const DrawerContent = ({ isStreamer, hideAudience, firebase }) => {
   const theme = useTheme();
   const classes = useStyles();
   const streamRef = useStreamRef();
   const [value, setValue] = React.useState(isStreamer ? 1 : 0);
   const [participatingStudents, setParticipatingStudents] = React.useState(
      undefined
   );

   const {
      currentLivestream: { talentPool, id: streamId },
   } = useCurrentStream();

   useEffect(() => {
      if (streamId) {
         const unsubscribe = firebase.listenToAllLivestreamParticipatingStudents(
            streamRef,
            (querySnapshot) => {
               const participatingStudents = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  inTalentPool: talentPool?.includes(doc.id),
               }));
               setParticipatingStudents(participatingStudents);
            }
         );

         return () => unsubscribe();
      }
   }, [streamId, talentPool]);

   const handleChange = (event, newValue) => {
      setValue(newValue);
   };

   const handleChangeIndex = (index) => {
      setValue(index);
   };

   const tabs = [<Tab key={0} label="People who joined" />];

   const panels = [
      <SwipeablePanel
         className={classes.panel}
         value={value}
         key={0}
         index={0}
         dir={theme.direction}
      >
         <PeopleWhoJoinedTab
            participatingStudents={participatingStudents}
            isStreamer={isStreamer}
         />
      </SwipeablePanel>,
   ];

   if (isStreamer) {
      tabs.push(<Tab key={1} label="Breakdown" />);
      panels.push(
         <SwipeablePanel
            className={classes.panel}
            value={value}
            key={1}
            index={1}
            dir={theme.direction}
         >
            <BreakdownTab audience={participatingStudents || []} />
         </SwipeablePanel>
      );
   }

   return (
      <React.Fragment>
         <AppBar
            className={classes.audienceAppBar}
            position="static"
            color="default"
         >
            <Box p={0.5}>
               <IconButton onClick={hideAudience} color="inherit">
                  <ArrowForwardIosIcon />
               </IconButton>
            </Box>
            <Tabs
               value={value}
               className={classes.audienceTabs}
               onChange={handleChange}
               indicatorColor="primary"
               textColor="primary"
               variant="fullWidth"
               aria-label="full width tabs example"
            >
               {tabs}
            </Tabs>
         </AppBar>
         <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            style={{ flex: 1, display: "flex" }}
            containerStyle={{ flex: 1 }}
            onChangeIndex={handleChangeIndex}
         >
            {panels}
         </SwipeableViews>
      </React.Fragment>
   );
};

DrawerContent.propTypes = {
   firebase: PropTypes.object,
   hideAudience: PropTypes.func,
   isStreamer: PropTypes.bool,
};

const AudienceDrawer = ({
   audienceDrawerOpen,
   hideAudience,
   isStreamer,
   firebase,
}) => {
   const classes = useStyles();

   return (
      <Drawer
         PaperProps={{
            className: classes.drawerContent,
         }}
         anchor="right"
         open={audienceDrawerOpen}
         onClose={hideAudience}
      >
         <DrawerContent
            firebase={firebase}
            hideAudience={hideAudience}
            isStreamer={isStreamer}
         />
      </Drawer>
   );
};

AudienceDrawer.propTypes = {
   audienceDrawerOpen: PropTypes.bool.isRequired,
   hideAudience: PropTypes.func.isRequired,
   isStreamer: PropTypes.bool.isRequired,
};

export default withFirebase(AudienceDrawer);
