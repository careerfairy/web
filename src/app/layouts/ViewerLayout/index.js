import React, { useCallback, useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { useFirebase } from "context/firebase";
import { useRouter } from "next/router";
import ViewerTopBar from "./ViewerTopBar";
import { isLoaded } from "react-redux-firebase";
import { useAuth } from "../../HOCs/AuthProvider";
import Loader from "../../components/views/loader/Loader";
import { useMediaQuery } from "@material-ui/core";
import LeftMenu from "../../components/views/viewer/LeftMenu/LeftMenu";
import { v4 as uuidv4 } from "uuid";
import { CurrentStreamContext } from "../../context/stream/StreamContext";
import useStreamConnect from "../../components/custom-hook/useStreamConnect";
import PropTypes from "prop-types";
import useStreamRef from "../../components/custom-hook/useStreamRef";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import useViewerHandRaiseConnect from "../../components/custom-hook/useViewerHandRaiseConnect";
import StatsUtil from "../../data/util/StatsUtil";
import GroupsUtil from "../../data/util/GroupsUtil";
import ViewerGroupCategorySelectMenu from "../../components/views/viewer/ViewerGroupCategorySelectMenu";

const useStyles = makeStyles((theme) => ({
   root: {
      position: "relative",
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
      paddingLeft: ({ showMenu, mobile }) => (showMenu && !mobile ? 280 : 0),
      transition: theme.transitions.create("padding-left", {
         duration: theme.transitions.duration.shortest,
         easing: theme.transitions.easing.easeInOut,
      }),
      [theme.breakpoints.down("mobile")]: {
         width: "100%",
         paddingTop: 0,
         paddingLeft: 0,
      },
      [theme.breakpoints.up("mobile")]: {
         paddingTop: ({ focusModeEnabled }) => !focusModeEnabled && 55,
      },
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
}));

const ViewerLayout = (props) => {
   const { children, isBreakout } = props;
   const firebase = useFirebase();
   const {
      query: { livestreamId, breakoutRoomId, token, isRecordingWindow },
      replace,
      asPath,
   } = useRouter();
   const dispatch = useDispatch();
   const { authenticatedUser, userData } = useAuth();
   const {
      breakpoints: { values },
   } = useTheme();
   const mobile = useMediaQuery(`(max-width:${values.mobile}px)`);
   const streamRef = useStreamRef();
   const [audienceDrawerOpen, setAudienceDrawerOpen] = useState(false);
   const [handRaiseActive, setHandRaiseActive] = useState(false);
   const [streamerId, setStreamerId] = useState(null);
   const showMenu = useSelector((state) => state.stream.layout.leftMenuOpen);

   const focusModeEnabled = useSelector(
      (state) => state.stream.layout.focusModeEnabled
   );
   const spyModeEnabled = useSelector(
      (state) => state.stream.streaming.spyModeEnabled
   );
   const classes = useStyles({ showMenu, mobile, focusModeEnabled });
   const [selectedState, setSelectedState] = useState("questions");
   const [notAuthorized, setNotAuthorized] = useState(false);
   const [checkingForCategoryData, setCheckingForCategoryData] = useState(
      false
   );
   const [hasCheckedForCategoryData, setHasCheckedForCategoryData] = useState(
      false
   );
   const [groupsToFollow, setGroupsToFollow] = useState([]);
   const [groupToUpdateCategories, setGroupToUpdateCategories] = useState(null);
   const [groupsWithPolicies, setGroupsWithPolicies] = useState([]);

   const currentLivestream = useStreamConnect();

   useViewerHandRaiseConnect(currentLivestream);
   // console.log("-> currentLivestream", currentLivestream);
   useEffect(() => {
      if (currentLivestream && !currentLivestream.test) {
         if (token) {
            firebase.getLivestreamSecureTokenWithRef(streamRef).then((doc) => {
               if (!doc.exists) {
                  router.push("/streaming/error");
               }
               let storedToken = doc.data().value;
               if (storedToken !== token) {
                  setNotAuthorized(false);
               }
            });
         } else {
            setNotAuthorized(
               currentLivestream &&
                  !currentLivestream.test &&
                  authenticatedUser?.isLoaded &&
                  authenticatedUser?.isEmpty
            );
         }
      }
   }, [token, currentLivestream?.test, currentLivestream?.id]);

   useEffect(() => {
      if (Boolean(isRecordingWindow)) {
         dispatch(actions.setFocusMode(true, mobile));
      }
   }, [isRecordingWindow]);

   useEffect(() => {
      if (mobile) {
         closeLeftMenu();
      } else {
         if (!focusModeEnabled) {
            openLeftMenu();
         }
      }
   }, [mobile]);

   useEffect(() => {
      if (userData?.isAdmin) return;
      if (userData?.userEmail) {
         if (livestreamId && hasCheckedForCategoryData) {
            firebase.setUserIsParticipating(livestreamId, userData);
         }
         if (breakoutRoomId) {
            firebase.setUserIsParticipatingWithRef(streamRef, userData);
         }
      }
   }, [
      livestreamId,
      userData?.email,
      userData?.isAdmin,
      userData?.linkedinUrl,
      userData?.firstName,
      userData?.lastName,
      userData?.registeredGroups,
      breakoutRoomId,
      streamRef,
      hasCheckedForCategoryData,
   ]);

   useEffect(() => {
      if (currentLivestream && !streamerId) {
         if (currentLivestream.test && authenticatedUser?.email) {
            setStreamerId(currentLivestream.id + authenticatedUser.email);
         } else if (currentLivestream.test) {
            let uuid = uuidv4();
            let joiningId = uuid.replace(/-/g, "");
            setStreamerId(currentLivestream.id + joiningId);
         } else if (authenticatedUser?.email) {
            setStreamerId(currentLivestream.id + authenticatedUser.email);
         } else if (isRecordingWindow) {
            setStreamerId(uuidv4());
         }
      }
   }, [
      currentLivestream?.test,
      currentLivestream?.id,
      authenticatedUser?.email,
   ]);

   useEffect(() => {
      if (currentLivestream?.hasStarted || spyModeEnabled) {
         dispatch(actions.unmuteAllRemoteVideos());
      } else {
         dispatch(actions.muteAllRemoteVideos());
      }
   }, [currentLivestream?.hasStarted, spyModeEnabled]);

   useEffect(() => {
      const checkForCategoryData = async () => {
         try {
            if (
               !currentLivestream?.test &&
               currentLivestream?.groupIds?.length &&
               !breakoutRoomId
            ) {
               setCheckingForCategoryData(true);
               const livestreamGroups = await firebase.getGroupsWithIds(
                  currentLivestream.groupIds
               );
               const {
                  hasAgreedToAll,
                  groupsWithPolicies,
               } = await GroupsUtil.getPolicyStatus(
                  livestreamGroups,
                  userData.userEmail,
                  firebase
               );
               const groupThatUserFollows = StatsUtil.getGroupThatStudentFollows(
                  userData,
                  livestreamGroups
               );
               if (!groupThatUserFollows) {
                  // If user is not following any of the groups bring up group following Dialog
                  // Open the follow group dialog...
                  if (livestreamGroups?.length) {
                     // Only open dialog when there are groups
                     setGroupsToFollow(livestreamGroups);
                  }
               } else {
                  // If user is following one of the groups, please check if the user has all the categories of the group
                  const userHasAllCategoriesOfGroup = StatsUtil.studentHasAllCategoriesOfGroup(
                     userData,
                     groupThatUserFollows
                  );
                  if (!userHasAllCategoriesOfGroup) {
                     // Open the category select dialog...
                     setGroupToUpdateCategories(groupThatUserFollows);
                     if (!hasAgreedToAll) {
                        setGroupsWithPolicies(groupsWithPolicies);
                     }
                  }
               }
            }
         } catch (e) {}
         setCheckingForCategoryData(false);
         setHasCheckedForCategoryData(true);
      };

      checkForCategoryData();
   }, [Boolean(userData), Boolean(currentLivestream)]);

   if (notAuthorized) {
      replace({
         pathname: `/login`,
         query: { absolutePath: asPath },
      });
   }

   const closeLeftMenu = () => dispatch(actions.closeLeftMenu());
   const openLeftMenu = () => dispatch(actions.openLeftMenu());

   const handleCloseViewerGroupCategorySelectDialog = useCallback(() => {
      setGroupsToFollow([]);
      setGroupToUpdateCategories(null);
   }, []);

   const handleStateChange = useCallback(
      (state) => {
         if (!showMenu) {
            openLeftMenu();
         }
         setSelectedState(state);
      },
      [showMenu]
   );

   const showAudience = useCallback(() => {
      setAudienceDrawerOpen(true);
   }, []);

   const hideAudience = useCallback(() => {
      setAudienceDrawerOpen(false);
   }, []);

   if (
      !isLoaded(currentLivestream) ||
      notAuthorized ||
      checkingForCategoryData ||
      !hasCheckedForCategoryData
   ) {
      return <Loader />;
   }

   if (groupToUpdateCategories || groupsToFollow.length) {
      return (
         <ViewerGroupCategorySelectMenu
            onClose={handleCloseViewerGroupCategorySelectDialog}
            groupToUpdateCategories={groupToUpdateCategories}
            groupsToFollow={groupsToFollow}
            groupsWithPolicies={groupsWithPolicies}
         />
      );
   }

   return (
      <CurrentStreamContext.Provider value={{ currentLivestream, isBreakout }}>
         <div className={`${classes.root} notranslate`}>
            <ViewerTopBar
               showAudience={showAudience}
               showMenu={showMenu}
               audienceDrawerOpen={audienceDrawerOpen}
               mobile={mobile}
            />
            <LeftMenu
               handRaiseActive={handRaiseActive}
               setHandRaiseActive={setHandRaiseActive}
               streamer={false}
               handleStateChange={handleStateChange}
               selectedState={selectedState}
               setSelectedState={setSelectedState}
               livestream={currentLivestream}
               isMobile={mobile}
            />

            <div className={classes.wrapper}>
               <div className={classes.contentContainer}>
                  <div className={classes.content}>
                     {React.cloneElement(children, {
                        handRaiseActive,
                        handleStateChange,
                        selectedState,
                        setSelectedState,
                        showMenu,
                        streamerId,
                        mobile,
                        showAudience,
                        hideAudience,
                        audienceDrawerOpen,
                     })}
                  </div>
               </div>
            </div>
         </div>
      </CurrentStreamContext.Provider>
   );
};

ViewerLayout.propTypes = {
   children: PropTypes.node.isRequired,
};

export default ViewerLayout;
