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
import {
   focusModeEnabledSelector,
   leftMenuOpenSelector,
} from "../../../../store/selectors/streamSelectors"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import JobsCategory from "../../streaming/LeftMenu/categories/JobsCategory"
import GenericCategoryInactive from "../../streaming/sharedComponents/GenericCategoryInactive"
import { LEFT_MENU_WIDTH } from "../../../../constants/streams"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { CurrentStreamContextInterface } from "../../../../context/stream/StreamContext"

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
   blur: {
      backgroundColor: alpha(theme.palette.common.black, 0.2),
      backdropFilter: "blur(5px)",
   },
   mobileDrawer: {
      width: "100%",
   },
   // @ts-ignore
   desktopDrawer: ({ focusModeEnabled }) => ({
      width: LEFT_MENU_WIDTH,
      top: focusModeEnabled ? 0 : 55,
      height: focusModeEnabled ? "100%" : "calc(100% - 55px)",
      boxShadow: theme.shadows[15],
   }),
}))

type ViewEntry = {
   state: CurrentStreamContextInterface["selectedState"]
   component: JSX.Element
}

const LeftMenu = ({
   handRaiseActive,
   setHandRaiseActive,
   streamer,
   setSelectedState,
   selectedState,
   livestream,
   isMobile,
   streamFinished,
}: LeftMenuProps) => {
   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const showMenu = useSelector(leftMenuOpenSelector)
   const { userData, authenticatedUser: user } = useAuth()
   const theme = useTheme()
   const classes = useStyles({ showMenu, isMobile, focusModeEnabled })
   const [value, setValue] = useState(0)
   const dispatch = useDispatch()

   const eventHasJobs = Boolean(livestream?.hasJobs)

   const handleCloseLeftMenu = useCallback(() => {
      return dispatch(actions.closeLeftMenu())
   }, [dispatch])

   const handleOpenLeftMenu = useCallback(() => {
      return dispatch(actions.openLeftMenu())
   }, [dispatch])

   useEffect(() => {
      if (
         selectedState === "chat" &&
         showMenu &&
         !isMobile &&
         !focusModeEnabled
      ) {
         setSelectedState("questions")
      }
   }, [selectedState, showMenu, isMobile, focusModeEnabled, setSelectedState])

   useEffect(() => {
      if (!streamFinished) return

      if (eventHasJobs) {
         void handleOpenLeftMenu()
         setSelectedState("jobs")
         return
      }

      void handleCloseLeftMenu()
   }, [
      eventHasJobs,
      handleCloseLeftMenu,
      handleOpenLeftMenu,
      setSelectedState,
      streamFinished,
   ])

   const views = useMemo(() => {
      const data: ViewEntry[] = []

      if (!streamFinished) {
         data.unshift({
            state: "hand",
            component: (
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
               />
            ),
         })

         if (showMenu && (isMobile || focusModeEnabled) && !streamFinished) {
            data.push({
               state: "chat",
               component: <ChatCategory key={"chat-category-tab"} />,
            })
         }

         data.unshift({
            state: "polls",
            component: (
               <PollCategory
                  key={"polls-category-tab"}
                  livestream={livestream}
                  //@ts-ignore
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                  streamer={streamer}
                  user={user}
                  userData={userData}
               />
            ),
         })
      }

      if (eventHasJobs) {
         data.push({
            state: "jobs",
            component: (
               <JobsCategory
                  key={"jobs-category-tab"}
                  selectedState={selectedState}
                  livestream={livestream}
                  showMenu={showMenu}
               />
            ),
         })
      }

      data.unshift({
         state: "questions",
         component: livestream.questionsDisabled ? (
            <GenericCategoryInactive
               title={"No Q&A Today"}
               subtitle={"The Q&A is disabled for this live stream."}
            />
         ) : (
            <QuestionCategory
               key={"questions-category-tab"}
               showMenu={showMenu}
               streamer={streamer}
               isMobile={isMobile}
               selectedState={selectedState}
            />
         ),
      })

      return data
   }, [
      eventHasJobs,
      focusModeEnabled,
      handRaiseActive,
      isMobile,
      livestream,
      selectedState,
      setHandRaiseActive,
      setSelectedState,
      showMenu,
      streamFinished,
      streamer,
      user,
      userData,
   ])

   const handleChange = useCallback(
      (newIndex, _, meta) => {
         if (meta?.reason !== "swipe") return
         const state = views[newIndex].state
         setSelectedState(state)
         dataLayerEvent("livestream_viewer_select_" + state)
      },
      [views, setSelectedState]
   )

   useEffect(() => {
      let newSelectedIndex = views.findIndex(
         (item) => item.state === selectedState
      )
      if (value !== newSelectedIndex && newSelectedIndex !== -1) {
         setValue(newSelectedIndex)
      }
   }, [eventHasJobs, selectedState, views, value])

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
            className={classes.viewRoot}
            onChangeIndex={handleChange}
         >
            {views.map((item) => item.component)}
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
               onClose={handleCloseLeftMenu}
               open={showMenu}
               variant="persistent"
            >
               {content}
            </Drawer>
         ) : (
            <Drawer
               anchor="left"
               classes={desktopDrawerClasses}
               open={showMenu}
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
   selectedState: CurrentStreamContextInterface["selectedState"]
   livestream: LivestreamEvent
   isMobile: boolean
   streamFinished: boolean
}

export default LeftMenu
