import React, { useCallback, useEffect, useMemo, useState } from "react"
import PollCategory from "./categories/PollCategory"
import HandRaiseCategory from "./categories/HandRaiseCategory"
import QuestionCategory from "../sharedComponents/QuestionCategory"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import SwipeableViews from "react-swipeable-views"
import clsx from "clsx"
import { Drawer, Fab } from "@mui/material"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import JobsCategory from "./categories/JobsCategory"
import { leftMenuOpenSelector } from "../../../../store/selectors/streamSelectors"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

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
      // @ts-ignore
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
}: LeftMenuProps) => {
   const [states, setStates] = useState(["questions", "polls", "hand"])
   const showMenu = useSelector(leftMenuOpenSelector)

   const theme = useTheme()
   const classes = useStyles()
   const dispatch = useDispatch()
   const [value, setValue] = useState(0)
   const isGlass = showMenu && smallScreen

   useEffect(() => {
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
   }, [dispatch])

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
               <JobsCategory key={"jobs-category-tab"} />,
            ])
         }
         setValue(3)
      }
   }, [selectedState, showMenu, states])

   const handleChange = useCallback(
      (event) => {
         setSliding(true)
         setValue(event)
         setSelectedState?.(states[event])
      },
      [setSelectedState, setSliding, states]
   )

   const [views, setViews] = useState([
      <QuestionCategory
         key={"question-category-tab"}
         sliding={sliding}
         showMenu={showMenu}
         streamer={streamer}
         livestream={livestream}
         selectedState={selectedState}
      />,
      <PollCategory
         key={"poll-category-tab"}
         sliding={sliding}
         showMenu={showMenu}
         livestream={livestream}
         selectedState={selectedState}
         streamer={streamer}
      />,
      <HandRaiseCategory
         key={"handraise-category-tab"}
         sliding={sliding}
         showMenu={showMenu}
         isGlass={isGlass}
         handleStateChange={handleStateChange}
         livestream={livestream}
         selectedState={selectedState}
      />,
   ])

   const toggleLeftMenu = useCallback(
      () => dispatch(actions.toggleLeftMenu()),
      [dispatch]
   )

   const onTransitionEnd = useCallback(() => setSliding(false), [setSliding])

   const drawerClasses = useMemo(
      () => ({
         paper: clsx(classes.desktopDrawer, {
            [classes.drawerSmallScreen]: isGlass,
         }),
      }),
      [classes.desktopDrawer, classes.drawerSmallScreen, isGlass]
   )

   return (
      <Drawer
         anchor="left"
         classes={drawerClasses}
         open={showMenu}
         variant={smallScreen ? "temporary" : "persistent"}
      >
         {showMenu && smallScreen && (
            <Fab
               className={classes.closeBtn}
               size="small"
               color="secondary"
               onClick={toggleLeftMenu}
            >
               <ChevronLeftRoundedIcon />
            </Fab>
         )}
         <SwipeableViews
            containerStyle={containerStyle}
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            slideStyle={slideStyle}
            onTransitionEnd={onTransitionEnd}
            className={classes.viewRoot}
            onChangeIndex={handleChange}
         >
            {views}
         </SwipeableViews>
      </Drawer>
   )
}

type LeftMenuProps = {
   streamer: any
   setSelectedState?: (args) => any
   selectedState: string
   livestream: LivestreamEvent
   isMobile?: boolean
   handleStateChange?: (args) => any
   setSliding?: (args) => any
   sliding?: boolean
   smallScreen?: boolean
}

const slideStyle = { overflowX: "hidden" }
const containerStyle = { WebkitOverflowScrolling: "touch" }

export default LeftMenu
