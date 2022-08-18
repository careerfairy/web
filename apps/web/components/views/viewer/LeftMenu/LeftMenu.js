import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import SwipeableViews from "react-swipeable-views"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import { Drawer, Fab } from "@mui/material"
import QuestionCategory from "../../streaming/sharedComponents/QuestionCategory"
import PollCategory from "./categories/PollCategory"
import HandRaiseCategory from "./categories/HandRaiseCategory"
import ChatCategory from "../../streaming/LeftMenu/categories/ChatCategory"
import { TabPanel } from "../../../../materialUI/GlobalPanels/GlobalPanels"
import clsx from "clsx"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import JobsCategory from "../../streaming/LeftMenu/categories/JobsCategory"

const useStyles = makeStyles((theme) => ({
   viewRoot: {
      position: "relative",
      height: "100%",
      // backgroundColor: theme.palette.background.default,
      "& .react-swipeable-view-container": {
         height: "100%",
      },
   },
   closeBtn: {
      position: "fixed",
      top: 10,
      right: 10,
      textAlign: "center",
      zIndex: 9100,
      background:
         theme.palette.mode === "dark" && theme.palette.background.paper,
      "&:hover": {
         background:
            theme.palette.mode === "dark" && theme.palette.background.default,
      },
      color: theme.palette.mode === "dark" && theme.palette.secondary.main,
   },
   slides: {
      // backgroundColor: theme.palette.background.default,
      // overflow: "visible !important"
   },
   blur: {
      backgroundColor: alpha(theme.palette.common.black, 0.2),
      backdropFilter: "blur(5px)",
   },
   mobileDrawer: {
      width: "100%",
   },
   desktopDrawer: ({ focusModeEnabled }) => ({
      width: 280,
      top: focusModeEnabled ? 0 : 55,
      height: focusModeEnabled ? "100%" : "calc(100% - 55px)",
      boxShadow: theme.shadows[15],
   }),
}))

const LeftMenu = ({
   handRaiseActive,
   setHandRaiseActive,
   streamer,
   setSelectedState,
   selectedState,
   livestream,
   isMobile,
}) => {
   const [states, setStates] = useState(["questions", "polls", "hand", "chat"])

   const focusModeEnabled = useSelector(
      (state) => state.stream.layout.focusModeEnabled
   )
   const showMenu = useSelector((state) => state.stream.layout.leftMenuOpen)
   const { userData, authenticatedUser: user } = useAuth()
   const theme = useTheme()
   const classes = useStyles({ showMenu, isMobile, focusModeEnabled })
   const [value, setValue] = useState(0)
   const dispatch = useDispatch()

   useEffect(() => {
      if (selectedState === "questions") {
         setValue(0)
      } else if (selectedState === "polls") {
         setValue(1)
      } else if (selectedState === "hand") {
         setValue(2)
      } else if (selectedState === "chat") {
         setValue(3)
      } else if (selectedState === "jobs") {
         // lazy add the jobs tab only when clicked for the first time
         // so that we avoid loading the jobs to when its strictly necessary
         if (!states.includes("jobs")) {
            setStates((prev) => [...prev, "jobs"])
            setViews((prev) => [
               ...prev,
               <TabPanel key={3} value={value} index={3} dir={theme.direction}>
                  <JobsCategory />
               </TabPanel>,
            ])
         }
         setValue(3)
      }
   }, [selectedState, showMenu, isMobile, states])
   useEffect(() => {
      if (
         selectedState === "chat" &&
         showMenu &&
         !isMobile &&
         !focusModeEnabled
      ) {
         setSelectedState("questions")
         setValue(0)
      }
   }, [selectedState, showMenu, isMobile])

   const handleChange = (event, newValue) => {
      setValue(newValue)
      setSelectedState(states[newValue])
   }

   const handleClose = () => {
      dispatch(actions.closeLeftMenu())
   }

   const [views, setViews] = useState([
      <TabPanel key={0} value={value} index={0} dir={theme.direction}>
         <QuestionCategory
            showMenu={showMenu}
            streamer={streamer}
            livestream={livestream}
            isMobile={isMobile}
            selectedState={selectedState}
            user={user}
            userData={userData}
         />
      </TabPanel>,
      <TabPanel key={1} value={value} index={1} dir={theme.direction}>
         <PollCategory
            livestream={livestream}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            streamer={streamer}
            user={user}
            userData={userData}
         />
      </TabPanel>,
      <TabPanel key={2} value={value} index={2} dir={theme.direction}>
         <HandRaiseCategory
            streamer={streamer}
            livestream={livestream}
            selectedState={selectedState}
            user={user}
            isMobile={isMobile}
            userData={userData}
            handRaiseActive={handRaiseActive}
            setHandRaiseActive={setHandRaiseActive}
         />
      </TabPanel>,
   ])

   if (showMenu && (isMobile || focusModeEnabled)) {
      views.push(
         <TabPanel key={3} value={value} index={3} dir={theme.direction}>
            <ChatCategory
               livestream={livestream}
               selectedState={selectedState}
               user={user}
               userData={userData}
               isStreamer={false}
            />
         </TabPanel>
      )
   }
   const content = (
      <>
         {isMobile && showMenu && (
            <Fab
               className={classes.closeBtn}
               size="large"
               color="secondary"
               onClick={() => dispatch(actions.toggleLeftMenu())}
            >
               <ChevronLeftRoundedIcon />
            </Fab>
         )}
         <SwipeableViews
            containerStyle={{ WebkitOverflowScrolling: "touch" }}
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            animateTransitions
            slideStyle={{ overflowX: "hidden" }}
            hysteresis={0.3}
            slideClassName={classes.slides}
            className={classes.viewRoot}
            onChangeIndex={handleChange}
         >
            {views}
         </SwipeableViews>
      </>
   )

   return (
      <>
         {isMobile ? (
            <Drawer
               anchor="left"
               classes={{ paper: clsx(classes.mobileDrawer, classes.blur) }}
               onClose={handleClose}
               open={showMenu}
               variant="persistent"
            >
               {content}
            </Drawer>
         ) : (
            <Drawer
               anchor="left"
               classes={{ paper: clsx(classes.desktopDrawer, classes.blur) }}
               open={focusModeEnabled ? showMenu : true}
               variant="persistent"
            >
               {content}
            </Drawer>
         )}
      </>
   )
}

LeftMenu.propTypes = {
   className: PropTypes.string,
   handRaiseActive: PropTypes.bool,
   handleStateChange: PropTypes.func.isRequired,
   isMobile: PropTypes.bool,
   livestream: PropTypes.object,
   selectedState: PropTypes.string.isRequired,
   setHandRaiseActive: PropTypes.func.isRequired,
   setSelectedState: PropTypes.func.isRequired,
   streamer: PropTypes.any,
}

export default LeftMenu
