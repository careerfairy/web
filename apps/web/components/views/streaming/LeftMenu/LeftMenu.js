import React, { useEffect, useState } from "react"
import PollCategory from "./categories/PollCategory"
import HandRaiseCategory from "./categories/HandRaiseCategory"
import QuestionCategory from "../sharedComponents/QuestionCategory"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { TabPanel } from "../../../../materialUI/GlobalPanels/GlobalPanels"
import SwipeableViews from "react-swipeable-views"
import clsx from "clsx"
import { Drawer, Fab } from "@mui/material"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import JobsCategory from "./categories/JobsCategory"

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
      zIndex: 1,
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
      zIndex: 1,
      background: theme.palette.background.default,
   },
   drawerSmallScreen: {
      width: "100%",
      top: 0,
      height: "100%",
      backgroundColor: alpha(theme.palette.common.black, 0.2),
      backdropFilter: "blur(5px)",
   },
}))

const LeftMenu = ({
   livestream,
   streamer,
   handleStateChange,
   sliding,
   setSliding,
   selectedState,
   setSelectedState,
   smallScreen,
}) => {
   const [states, setStates] = useState(["questions", "polls", "hand"])
   const showMenu = useSelector((state) => state.stream.layout.leftMenuOpen)

   const theme = useTheme()
   const classes = useStyles()
   const dispatch = useDispatch()
   const [value, setValue] = useState(0)
   const isGlass = showMenu && smallScreen

   useEffect(() => {
      if (!typeof window === "object") {
         return false
      }

      function handleResize() {
         if (window.innerWidth < 996) {
            dispatch(actions.closeLeftMenu())
         }
         if (window.innerWidth > 1248) {
            dispatch(actions.openLeftMenu())
         }
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
   }, [])

   useEffect(() => {
      if (selectedState === "questions") {
         setValue(0)
      } else if (selectedState === "polls") {
         setValue(1)
      } else if (selectedState === "hand") {
         setValue(2)
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
   }, [selectedState, showMenu, states])

   const handleChange = (event) => {
      setSliding(true)
      setValue(event)
      setSelectedState?.(states[event])
   }

   const [views, setViews] = useState([
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
            isGlass={isGlass}
            handleStateChange={handleStateChange}
            livestream={livestream}
            selectedState={selectedState}
         />
      </TabPanel>,
   ])

   return (
      <Drawer
         anchor="left"
         classes={{
            paper: clsx(classes.desktopDrawer, {
               [classes.drawerSmallScreen]: isGlass,
            }),
         }}
         open={showMenu}
         variant={smallScreen ? "temporary" : "persistent"}
      >
         {showMenu && smallScreen && (
            <Fab
               className={classes.closeBtn}
               size="small"
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
            slideStyle={{ overflowX: "hidden" }}
            onTransitionEnd={() => setSliding(false)}
            className={classes.viewRoot}
            onChangeIndex={handleChange}
         >
            {views}
         </SwipeableViews>
      </Drawer>
   )
}

export default LeftMenu
