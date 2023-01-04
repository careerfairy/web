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
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
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

const states = ["questions", "polls", "hand", "chat", "jobs"]

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
         const state = states[newValue]
         setSelectedState(state)
         dataLayerEvent("livestream_viewer_select_" + state)
      },
      [setSelectedState]
   )

   const handleClose = useCallback(() => {
      dispatch(actions.closeLeftMenu())
   }, [dispatch])

   const views = [
      livestream.questionsDisabled ? (
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
   ]
   if (!streamFinished) {
      views.unshift(
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
      )

      views.unshift(
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
      )
   }
   if (showMenu && (isMobile || focusModeEnabled) && !streamFinished) {
      views.push(<ChatCategory />)
   }

   if (livestream?.jobs?.length > 0) {
      views.push(
         <JobsCategory
            key={"jobs-category-tab"}
            selectedState={selectedState}
            livestream={livestream}
            showMenu={showMenu}
         />
      )
   }

   useEffect(() => {
      let newSelectedIndex = states.indexOf(selectedState)

      if (selectedState === "jobs" && views.length !== states.length) {
         // chat view might be missing, we need to go to the previous tab
         --newSelectedIndex
      }

      if (value !== newSelectedIndex) {
         setValue(newSelectedIndex)
      }
   }, [selectedState, value, views.length])

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
