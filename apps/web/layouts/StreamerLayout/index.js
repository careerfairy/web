import PropTypes from "prop-types"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import StreamerTopBar from "./StreamerTopBar"
import PreparationOverlay from "../../components/views/streaming/preparation-overlay/PreparationOverlay"
import LeftMenu from "../../components/views/streaming/LeftMenu/LeftMenu"
import Loader from "../../components/views/loader/Loader"
import { useRouter } from "next/router"
import NotificationsContext from "../../context/notifications/NotificationsContext"
import { CurrentStreamContext } from "../../context/stream/StreamContext"
import { v4 as uuidv4 } from "uuid"
import { isEmpty, isLoaded } from "react-redux-firebase"
import useMediaQuery from "@mui/material/useMediaQuery"
import useStreamConnect from "../../components/custom-hook/useStreamConnect"
import useStreamRef from "../../components/custom-hook/useStreamRef"
import useStreamerActiveHandRaisesConnect from "../../components/custom-hook/useStreamerActiveHandRaisesConnect"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import RTMProvider from "context/agora/RTMProvider"
import AgoraRTC from "agora-rtc-sdk-ng"
import BrowserIncompatibleOverlay from "../../components/views/streaming/BrowserIncompatibleOverlay"
import { leftMenuOpenSelector } from "../../store/selectors/streamSelectors"
import { agoraCredentials } from "../../data/agora/AgoraInstance"
import RTCProvider from "../../context/agora/RTCProvider"
import isEqual from "react-fast-compare"
import { LEFT_MENU_WIDTH } from "../../constants/streams"
import { dataLayerEvent } from "../../util/analyticsUtils"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import { useConditionalRedirect } from "../../components/custom-hook/useConditionalRedirect"
import { appendCurrentQueryParams } from "components/util/url"

const useStyles = makeStyles((theme) => ({
   "& ::-webkit-scrollbar": {
      width: "3px",
      backgroundColor: "transparent",
      borderRadius: theme.spacing(1),
   },
   "& ::-webkit-scrollbar-thumb": {
      borderRadius: theme.spacing(1),
      WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,.3)",
      backgroundColor: theme.palette.text.secondary,
   },
   root: {
      position: "relative",
      height: "100vh",
      width: "100%",
      touchAction: "manipulation",
      backgroundColor: theme.palette.background.dark,
      display: "flex",
      overflow: "hidden",
   },
   wrapper: {
      display: "flex",
      flex: "1 1 auto",
      overflow: "hidden",
      paddingTop: 55,
      paddingLeft: ({ showMenu, smallScreen }) =>
         showMenu && !smallScreen ? LEFT_MENU_WIDTH : 0,
      transition: theme.transitions.create("padding-left", {
         duration: theme.transitions.duration.standard,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   contentContainer: {
      display: "flex",
      flex: "1 1 auto",
      overflow: "hidden",
   },
   content: {
      flex: "1 1 auto",
      height: "100%",
      background: theme.palette.common.black,
      position: "relative",
      // overflow: 'auto'
   },
   menuLeft: {
      position: "absolute",
      transition: "width 0.3s",
      transitionTimingFunction: theme.transitions.easeInOut,
      width: ({ showMenu }) => (showMenu ? LEFT_MENU_WIDTH : 0),
      top: 55,
      left: 0,
      bottom: 0,
      // zIndex: 20,
      boxShadow: theme.shadows[7],
   },
}))
const browserIsCompatible = AgoraRTC.checkSystemRequirements()
const StreamerLayout = (props) => {
   const { children, isBreakout, isMainStreamer } = props
   const firebase = useFirebaseService()
   const {
      query: { token, livestreamId: baseStreamId, breakoutRoomId, auto },
   } = useRouter()
   const livestreamId = breakoutRoomId || baseStreamId
   const router = useRouter()
   const streamRef = useStreamRef()
   const smallScreen = useMediaQuery("(max-width:700px)")
   const [newNotification, setNewNotification] = useState(null)
   // eslint-disable-next-line react/hook-use-state
   const [notificationToRemove] = useState(null)
   const [notifications, setNotifications] = useState([])
   const [streamerId, setStreamerId] = useState("")
   const dispatch = useDispatch()

   const [streamerReady, setStreamerReady] = useState(false)
   const [tokenChecked, setTokenChecked] = useState(false)
   const showMenu = useSelector(leftMenuOpenSelector, isEqual)
   const [audienceDrawerOpen, setAudienceDrawerOpen] = useState(false)
   const [selectedState, setSelectedState] = useState("questions")
   const [sliding, setSliding] = useState(false)

   const currentLivestream = useStreamConnect()
   useStreamerActiveHandRaisesConnect()

   const classes = useStyles({
      showMenu,
      hasStarted: currentLivestream?.hasStarted,
      smallScreen,
   })

   useEffect(() => {
      if (
         router &&
         router.query &&
         currentLivestream &&
         !currentLivestream.test
      ) {
         if (!token) {
            router.push("/streaming/error")
         } else {
            firebase.getLivestreamSecureTokenWithRef(streamRef).then((doc) => {
               if (!doc.exists) {
                  router.push("/streaming/error")
               }
               let storedToken = doc.data().value
               if (storedToken !== token) {
                  router.push("/streaming/error")
               } else {
                  setTokenChecked(true)
               }
            })
         }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router, token, currentLivestream?.test, currentLivestream?.id])

   useEffect(() => {
      function checkIfStreamerHasInfo() {
         let storedUuid = localStorage.getItem("streamingUuid")
         const hasStreamerInfo = currentLivestream?.liveSpeakers?.some(
            (speaker) =>
               speaker.speakerUuid?.replace(currentLivestream.id, "") ===
               storedUuid
         )
         setStreamerReady(Boolean(hasStreamerInfo))
      }

      if (currentLivestream && auto === "true") {
         checkIfStreamerHasInfo()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [currentLivestream?.liveSpeakers, auto])

   useEffect(() => {
      const regex = /-/g
      if (livestreamId) {
         if (localStorage.getItem("streamingUuid")) {
            let storedUuid = localStorage.getItem("streamingUuid")
            let joiningId = storedUuid.replace(regex, "")
            setStreamerId(livestreamId + joiningId)
         } else {
            let uuid = uuidv4()
            let joiningId = uuid.replace(regex, "")
            localStorage.setItem("streamingUuid", joiningId)
            setStreamerId(livestreamId + joiningId)
         }
      }
   }, [livestreamId, isMainStreamer, currentLivestream?.id])

   useEffect(() => {
      if (newNotification) {
         setNotifications([...notifications, newNotification])
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [newNotification])

   useEffect(() => {
      if (smallScreen && showMenu) {
         closeLeftMenu()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [smallScreen])

   useEffect(() => {
      if (notificationToRemove) {
         let updatedNotifications = notifications.filter(
            (not) => not.id !== notificationToRemove
         )
         setNotifications(updatedNotifications)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [notificationToRemove])

   const closeLeftMenu = () => dispatch(actions.closeLeftMenu())
   const openLeftMenu = () => dispatch(actions.openLeftMenu())

   const showAudience = useCallback(() => {
      setAudienceDrawerOpen(true)
      dataLayerEvent("livestream_streamer_show_audience_tab")
   }, [])

   const hideAudience = useCallback(() => {
      setAudienceDrawerOpen(false)
   }, [])

   const handleStateChange = useCallback(
      (state) => {
         if (!showMenu) {
            openLeftMenu()
         }
         setSliding(true)
         setSelectedState(state)
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [showMenu]
   )

   const notificationsContextValue = useMemo(
      () => ({
         notifications,
         setNewNotification,
      }),
      [notifications, setNewNotification]
   )
   const currentStreamContextValue = useMemo(
      () => ({
         currentLivestream,
         isBreakout,
         isMainStreamer,
         selectedState,
         isStreamer: true,
         streamerId,
         isMobile: undefined,
         presenter: currentLivestream
            ? LivestreamPresenter.createFromDocument(currentLivestream)
            : null,
      }),
      [currentLivestream, isBreakout, isMainStreamer, selectedState, streamerId]
   )

   useConditionalRedirect(
      /**
       * Redirect to the new UI ONLY under the following conditions:
       * - The stream is not a breakout room (new UI does not support breakout rooms)
       * - The token has been verified OR it's a test stream
       */
      !isBreakout && (tokenChecked || currentLivestream?.test)
         ? currentLivestream?.useNewUI
         : false,
      appendCurrentQueryParams(`/streaming/host/${livestreamId}`)
   )

   const tokenIsValidated = () => {
      if (currentLivestream?.test) {
         return true
      } else {
         return tokenChecked
      }
   }

   if (!browserIsCompatible) {
      return <BrowserIncompatibleOverlay />
   }

   if (
      !isLoaded(currentLivestream) ||
      !tokenIsValidated() ||
      isEmpty(currentLivestream)
   ) {
      return <Loader />
   }

   if (!streamerReady && tokenIsValidated()) {
      return (
         <PreparationOverlay
            livestream={currentLivestream}
            streamerUuid={streamerId}
            setStreamerReady={setStreamerReady}
         />
      )
   }

   return (
      <RTCProvider
         uid={streamerId}
         channel={livestreamId}
         screenSharerId={currentLivestream?.screenSharerId}
         streamMode={currentLivestream?.mode}
         appId={agoraCredentials.appID}
         initialize
         isStreamer
      >
         <RTMProvider
            livestreamId={baseStreamId}
            roomId={currentLivestream.id}
            userId={streamerId}
         >
            <NotificationsContext.Provider value={notificationsContextValue}>
               <CurrentStreamContext.Provider value={currentStreamContextValue}>
                  <div className={classes.root}>
                     <StreamerTopBar
                        firebase={firebase}
                        showAudience={showAudience}
                     />
                     <LeftMenu
                        handleStateChange={handleStateChange}
                        selectedState={selectedState}
                        smallScreen={smallScreen}
                        streamer={true}
                        sliding={sliding}
                        setSliding={setSliding}
                        livestream={currentLivestream}
                     />

                     <div className={classes.wrapper}>
                        <div className={classes.contentContainer}>
                           <div className={classes.content}>
                              {React.cloneElement(children, {
                                 ...props,
                                 hideAudience,
                                 audienceDrawerOpen,
                                 smallScreen,
                                 selectedState,
                                 handleStateChange,
                                 showMenu,
                              })}
                           </div>
                        </div>
                     </div>
                  </div>
               </CurrentStreamContext.Provider>
            </NotificationsContext.Provider>
         </RTMProvider>
      </RTCProvider>
   )
}

StreamerLayout.propTypes = {
   children: PropTypes.node.isRequired,
   firebase: PropTypes.object,
}
export default StreamerLayout
