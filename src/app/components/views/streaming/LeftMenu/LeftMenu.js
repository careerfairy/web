import React, { useEffect, useState } from "react";
import { withFirebase } from "../../../../context/firebase";
import ButtonComponent from "../sharedComponents/ButtonComponent";
import PollCategory from "./categories/PollCategory";
import HandRaiseCategory from "./categories/HandRaiseCategory";
import QuestionCategory from "../sharedComponents/QuestionCategory";
import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";
import { TabPanel } from "../../../../materialUI/GlobalPanels/GlobalPanels";
import SwipeableViews from "react-swipeable-views";
import clsx from "clsx";
import { Drawer, Fab } from "@material-ui/core";
import ChevronLeftRoundedIcon from "@material-ui/icons/ChevronLeftRounded";

const useStyles = makeStyles((theme) => ({
   root: {},
   viewRoot: {
      position: "relative",
      height: "100%",
      // backgroundColor: "rgb(220,220,220)",
      "& .react-swipeable-view-container": {
         height: "100%",
      },
   },
   closeBtn: {
      position: "fixed",
      top: 10,
      right: 10,
      textAlign: "center",
      // zIndex: 9100,
   },
   desktopDrawer: {
      width: 280,
      top: 55,
      height: "calc(100% - 55px)",
      boxShadow: theme.shadows[15],
      position: "absolute",
      transition: "width 0.3s",
      transitionTimingFunction: theme.transitions.easeInOut,
      left: 0,
      bottom: 0,
      // zIndex: 20,
      background: theme.palette.background.default,
   },
   drawerSmallScreen: {
      width: "100%",
      top: 0,
      height: "100%",
      backgroundColor: alpha(theme.palette.common.black, 0.2),
      backdropFilter: "blur(5px)",
   },
}));

const states = ["questions", "polls", "hand"];
const LeftMenu = ({
   showMenu,
   livestream,
   streamer,
   handleStateChange,
   sliding,
   setSliding,
   selectedState,
   setSelectedState,
   setShowMenu,
   smallScreen,
   toggleShowMenu,
}) => {
   const theme = useTheme();
   const classes = useStyles();
   const [value, setValue] = useState(0);

   useEffect(() => {
      if (!typeof window === "object") {
         return false;
      }

      function handleResize() {
         if (window.innerWidth < 996) {
            setShowMenu(false);
         }
         if (window.innerWidth > 1248) {
            setShowMenu(true);
         }
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   useEffect(() => {
      if (selectedState === "questions") {
         setValue(0);
      } else if (selectedState === "polls") {
         setValue(1);
      } else if (selectedState === "hand") {
         setValue(2);
      }
   }, [selectedState, showMenu]);

   const handleChange = (event) => {
      setSliding(true);
      setValue(event);
      setSelectedState?.(states[event]);
   };

   const views = [
      <TabPanel key={0} value={value} index={0} dir={theme.direction}>
         <QuestionCategory
            sliding={sliding}
            showMenu={showMenu}
            streamer={streamer}
            livestream={livestream}
            selectedState={selectedState}
         />
      </TabPanel>,
      <TabPanel key={1} value={value} index={1} dir={theme.direction}>
         <PollCategory
            sliding={sliding}
            showMenu={showMenu}
            livestream={livestream}
            selectedState={selectedState}
            streamer={streamer}
         />
      </TabPanel>,
      <TabPanel key={2} value={value} index={2} dir={theme.direction}>
         <HandRaiseCategory
            sliding={sliding}
            showMenu={showMenu}
            livestream={livestream}
            selectedState={selectedState}
         />
      </TabPanel>,
   ];

   return (
      <Drawer
         anchor="left"
         classes={{
            paper: clsx(classes.desktopDrawer, {
               [classes.drawerSmallScreen]: showMenu && smallScreen,
            }),
         }}
         open={showMenu}
         variant={smallScreen ? "temporary" : "persistent"}
      >
         {showMenu && smallScreen && (
            <Fab
               className={classes.closeBtn}
               size="large"
               color="secondary"
               onClick={toggleShowMenu}
            >
               <ChevronLeftRoundedIcon />
            </Fab>
         )}
         <SwipeableViews
            containerStyle={{ WebkitOverflowScrolling: "touch" }}
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            slideStyle={{ overflowX: "hidden" }}
            onTransitionEnd={() => setSliding(false)}
            className={classes.viewRoot}
            onChangeIndex={handleChange}
         >
            {views}
         </SwipeableViews>
      </Drawer>
   );
};

export default withFirebase(LeftMenu);
