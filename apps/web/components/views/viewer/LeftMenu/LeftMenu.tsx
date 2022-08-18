import React, { useCallback, useEffect, useMemo, useState } from "react"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import SwipeableViews from "react-swipeable-views"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import { Drawer, Fab } from "@mui/material"
import QuestionCategory from "../../streaming/sharedComponents/QuestionCategory"
import PollCategory from "./categories/PollCategory"
import HandRaiseCategory from "./categories/HandRaiseCategory"
import ChatCategory from "../../streaming/LeftMenu/categories/ChatCategory"
import clsx from "clsx"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import JobsCategory from "../../streaming/LeftMenu/categories/JobsCategory"
import {
   focusModeEnabledSelector,
   leftMenuOpenSelector,
} from "../../../../store/selectors/streamSelectors"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

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
   // @ts-ignore
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
}: LeftMenuProps) => {
   const [states, setStates] = useState(["questions", "polls", "hand"])

   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const showMenu = useSelector(leftMenuOpenSelector)
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
         setValue(states.indexOf("chat"))
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
         setValue(states.indexOf("jobs"))
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
   }, [selectedState, showMenu, isMobile, focusModeEnabled, setSelectedState])

   const handleChange = useCallback(
      (event, newValue) => {
         setValue(newValue)
         setSelectedState(states[newValue])
      },
      [setSelectedState, states]
   )

   const handleClose = useCallback(() => {
      dispatch(actions.closeLeftMenu())
   }, [dispatch])

   const [views, setViews] = useState([
      <QuestionCategory
         key={"questions-category-tab"}
         showMenu={showMenu}
         streamer={streamer}
         livestream={livestream}
         isMobile={isMobile}
         selectedState={selectedState}
         user={user}
         userData={userData}
      />,
      <PollCategory
         key={"polls-category-tab"}
         livestream={livestream}
         //@ts-ignore
         selectedState={selectedState}
         setSelectedState={setSelectedState}
         streamer={streamer}
         user={user}
         userData={userData}
      />,
      <HandRaiseCategory
         key={"handraise-category-tab"}
         // @ts-ignore
         streamer={streamer}
         // @ts-ignore
         livestream={livestream}
         selectedState={selectedState}
         user={user}
         isMobile={isMobile}
         userData={userData}
         handRaiseActive={handRaiseActive}
         setHandRaiseActive={setHandRaiseActive}
      />,
   ])

   useEffect(() => {
      if (showMenu && (isMobile || focusModeEnabled)) {
         if (!states.includes("chat")) {
            setStates((prev) => [...prev, "chat"])
            setViews((prev) => [
               ...prev,
               <ChatCategory
                  key={"chat-category-tab"}
                  livestream={livestream}
                  selectedState={selectedState}
                  // @ts-ignore
                  user={user}
                  userData={userData}
                  isStreamer={false}
               />,
            ])
         }
      }
   }, [
      focusModeEnabled,
      isMobile,
      livestream,
      selectedState,
      showMenu,
      states,
      user,
      userData,
   ])

   const toggleLeftMenu = useCallback(
      () => dispatch(actions.toggleLeftMenu()),
      [dispatch]
   )

   const content = (
      <>
         {isMobile && showMenu && (
            <Fab
               className={classes.closeBtn}
               size="large"
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
            animateTransitions
            slideStyle={slideStyle}
            hysteresis={0.3}
            slideClassName={classes.slides}
            className={classes.viewRoot}
            onChangeIndex={handleChange}
         >
            {views}
         </SwipeableViews>
      </>
   )

   const mobileDrawerClasses = useMemo(
      () => ({ paper: clsx(classes.mobileDrawer, classes.blur) }),
      [classes.blur, classes.mobileDrawer]
   )

   const desktopDrawerClasses = useMemo(
      () => ({ paper: clsx(classes.desktopDrawer, classes.blur) }),
      [classes.blur, classes.desktopDrawer]
   )

   return (
      <>
         {isMobile ? (
            <Drawer
               anchor="left"
               classes={mobileDrawerClasses}
               onClose={handleClose}
               open={showMenu}
               variant="persistent"
            >
               {content}
            </Drawer>
         ) : (
            <Drawer
               anchor="left"
               classes={desktopDrawerClasses}
               open={focusModeEnabled ? showMenu : true}
               variant="persistent"
            >
               {content}
            </Drawer>
         )}
      </>
   )
}

const slideStyle = { overflowX: "hidden" }
const containerStyle = { WebkitOverflowScrolling: "touch" }

type LeftMenuProps = {
   handRaiseActive: boolean
   setHandRaiseActive: (args) => any
   streamer: any
   setSelectedState: (args) => any
   selectedState: string
   livestream: LivestreamEvent
   isMobile: boolean
}

export default LeftMenu
