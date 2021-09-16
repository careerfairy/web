import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { withFirebase } from "../../context/firebase";
import StreamerTopBar from "./StreamerTopBar";
import PreparationOverlay from "../../components/views/streaming/preparation-overlay/PreparationOverlay";
import LeftMenu from "../../components/views/streaming/LeftMenu/LeftMenu";
import Loader from "../../components/views/loader/Loader";
import { useRouter } from "next/router";
import NotificationsContext from "../../context/notifications/NotificationsContext";
import { CurrentStreamContext } from "../../context/stream/StreamContext";
import { v4 as uuidv4 } from "uuid";
import { isEmpty, isLoaded } from "react-redux-firebase";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useStreamConnect from "../../components/custom-hook/useStreamConnect";
import useStreamRef from "../../components/custom-hook/useStreamRef";

const useStyles = makeStyles((theme) => ({
   root: {
      position: "relative",
      // minHeight: "100vh",
      height: "100vh",
      width: "100%",
      touchAction: "manipulation",
      // border: "6px solid pink",
      backgroundColor: theme.palette.background.dark,
      display: "flex",
      // height: '100vh',
      overflow: "hidden",
   },
   wrapper: {
      display: "flex",
      flex: "1 1 auto",
      overflow: "hidden",
      paddingTop: 55,
      paddingLeft: ({ showMenu, smallScreen }) =>
         showMenu && !smallScreen ? 280 : 0,
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
      width: ({ showMenu }) => (showMenu ? 280 : 0),
      top: 55,
      left: 0,
      bottom: 0,
      // zIndex: 20,
      boxShadow: theme.shadows[7],
   },
}));

const StreamerLayout = (props) => {
   const { children, firebase, isBreakout, isMainStreamer } = props;
   const {
      query: { token, livestreamId: baseStreamId, breakoutRoomId, auto },
   } = useRouter();
   const livestreamId = breakoutRoomId || baseStreamId;
   const router = useRouter();
   const streamRef = useStreamRef();
   const smallScreen = useMediaQuery("(max-width:700px)");
   const [newNotification, setNewNotification] = useState(null);
   const [notificationToRemove, setNotificationToRemove] = useState(null);
   const [notifications, setNotifications] = useState([]);
   const [streamerId, setStreamerId] = useState(null);

   const [streamerReady, setStreamerReady] = useState(false);
   const [tokenChecked, setTokenChecked] = useState(false);
   const [showMenu, setShowMenu] = useState(true);
   const [audienceDrawerOpen, setAudienceDrawerOpen] = useState(false);
   const [selectedState, setSelectedState] = useState("questions");
   const [sliding, setSliding] = useState(false);

   const [showVideoButton, setShowVideoButton] = useState({
      paused: false,
      muted: false,
   });

   const currentLivestream = useStreamConnect();

   const classes = useStyles({
      showMenu,
      hasStarted: currentLivestream?.hasStarted,
      smallScreen,
   });

   useEffect(() => {
      if (
         router &&
         router.query &&
         currentLivestream &&
         !currentLivestream.test
      ) {
         if (!token) {
            router.push("/streaming/error");
         } else {
            firebase.getLivestreamSecureTokenWithRef(streamRef).then((doc) => {
               if (!doc.exists) {
                  router.push("/streaming/error");
               }
               let storedToken = doc.data().value;
               if (storedToken !== token) {
                  router.push("/streaming/error");
               } else {
                  setTokenChecked(true);
               }
            });
         }
      }
   }, [router, token, currentLivestream?.test, currentLivestream?.id]);

   useEffect(() => {
      function checkIfStreamerHasInfo() {
         let storedUuid = localStorage.getItem("streamingUuid");
         const hasStreamerInfo = currentLivestream?.liveSpeakers?.some(
            (speaker) =>
               speaker.speakerUuid.replace(currentLivestream.id, "") ===
               storedUuid
         );
         setStreamerReady(Boolean(hasStreamerInfo));
      }

      if (currentLivestream && auto === "true") {
         checkIfStreamerHasInfo();
      }
   }, [currentLivestream?.liveSpeakers, auto]);

   useEffect(() => {
      const regex = /-/g;
      if (livestreamId && !isMainStreamer) {
         if (localStorage.getItem("streamingUuid")) {
            let storedUuid = localStorage.getItem("streamingUuid");
            let joiningId = storedUuid.replace(regex, "");
            setStreamerId(livestreamId + joiningId);
         } else {
            let uuid = uuidv4();
            let joiningId = uuid.replace(regex, "");
            localStorage.setItem("streamingUuid", joiningId);
            setStreamerId(livestreamId + joiningId);
         }
      } else if (currentLivestream?.id) {
         setStreamerId(currentLivestream.id);
      }
   }, [livestreamId, isMainStreamer, currentLivestream?.id]);

   useEffect(() => {
      if (newNotification) {
         setNotifications([...notifications, newNotification]);
      }
   }, [newNotification]);

   useEffect(() => {
      if (smallScreen && showMenu) {
         setShowMenu(false);
      }
   }, [smallScreen]);

   useEffect(() => {
      if (notificationToRemove) {
         let updatedNotifications = notifications.filter(
            (not) => not.id !== notificationToRemove
         );
         setNotifications(updatedNotifications);
      }
   }, [notificationToRemove]);

   const showAudience = useCallback(() => {
      setAudienceDrawerOpen(true);
   }, []);

   const hideAudience = useCallback(() => {
      setAudienceDrawerOpen(false);
   }, []);


   const handleStateChange = useCallback(
      (state) => {
         if (!showMenu) {
            setShowMenu(true);
         }
         setSliding(true);
         setSelectedState(state);
      },
      [showMenu]
   );

   const tokenIsValidated = () => {
      if (currentLivestream?.test) {
         return true;
      } else {
         return tokenChecked;
      }
   };
   const toggleShowMenu = useCallback(() => {
      setShowMenu(!showMenu);
   }, [showMenu]);

   if (
      !isLoaded(currentLivestream) ||
      !tokenIsValidated() ||
      isEmpty(currentLivestream)
   ) {
      return <Loader />;
   }

   if (!streamerReady && tokenIsValidated()) {
      return (
         <PreparationOverlay
            livestream={currentLivestream}
            streamerUuid={streamerId}
            setStreamerReady={setStreamerReady}
         />
      );
   }

   return (
      <NotificationsContext.Provider
         value={{ setNewNotification, setNotificationToRemove }}
      >
         <CurrentStreamContext.Provider
            value={{
               currentLivestream,
               isBreakout,
               isMainStreamer,
               isStreamer: true,
               streamerId,
            }}
         >
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
                  showMenu={showMenu}
                  setShowMenu={setShowMenu}
                  toggleShowMenu={toggleShowMenu}
               />

               <div className={classes.wrapper}>
                  <div className={classes.contentContainer}>
                     <div className={classes.content}>
                        {React.cloneElement(children, {
                           ...props,
                           showVideoButton,
                           setShowVideoButton,
                           newNotification,
                           isMainStreamer,
                           isStreamer: true,
                           hideAudience,
                           audienceDrawerOpen,
                           setShowMenu,
                           setSliding,
                           smallScreen,
                           selectedState,
                           handleStateChange,
                           showAudience,
                           showMenu,
                           notifications,
                           streamerId,
                        })}
                     </div>
                  </div>
               </div>
            </div>
         </CurrentStreamContext.Provider>
      </NotificationsContext.Provider>
   );
};

StreamerLayout.propTypes = {
   children: PropTypes.node.isRequired,
   firebase: PropTypes.object,
};
export default withFirebase(StreamerLayout);
