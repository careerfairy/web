import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import ViewerTopBar from "./ViewerTopBar"
import { isLoaded } from "react-redux-firebase"
import { useAuth } from "../../HOCs/AuthProvider"
import Loader from "../../components/views/loader/Loader"
import { useMediaQuery } from "@mui/material"
import LeftMenu from "../../components/views/viewer/LeftMenu/LeftMenu"
import { v4 as uuidv4 } from "uuid"
import { CurrentStreamContext } from "../../context/stream/StreamContext"
import useStreamConnect from "../../components/custom-hook/useStreamConnect"
import PropTypes from "prop-types"
import useStreamRef from "../../components/custom-hook/useStreamRef"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import ViewerGroupCategorySelectMenu from "../../components/views/viewer/ViewerGroupCategorySelectMenu"
import RTMProvider from "context/agora/RTMProvider"
import useStreamerActiveHandRaisesConnect from "../../components/custom-hook/useStreamerActiveHandRaisesConnect"
import AgoraRTC from "agora-rtc-sdk-ng"
import BrowserIncompatibleOverlay from "../../components/views/streaming/BrowserIncompatibleOverlay"
import useRewardLivestreamAttendance from "../../components/custom-hook/useRewardLivestreamAttendance"
import useCountLivestreamAttendanceMinutes from "../../components/custom-hook/useCountLivestreamAttendanceMinutes"
import {
   focusModeEnabledSelector,
   leftMenuOpenSelector,
} from "../../store/selectors/streamSelectors"
import { groupRepo } from "../../data/RepositoryInstances"
import { checkIfUserHasAnsweredAllLivestreamGroupQuestions } from "../../components/views/common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import { agoraCredentials } from "../../data/agora/AgoraInstance"
import RTCProvider from "../../context/agora/RTCProvider"
import { LEFT_MENU_WIDTH } from "../../constants/streams"
import { dataLayerEvent } from "../../util/analyticsUtils"
import { errorLogAndNotify } from "../../util/CommonUtil"
import GroupsUtil from "../../data/util/GroupsUtil"

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
      paddingLeft: ({ showMenu, mobile }) =>
         showMenu && !mobile ? LEFT_MENU_WIDTH : 0,
      transition: theme.transitions.create("padding-left", {
         duration: theme.transitions.duration.shortest,
         easing: theme.transitions.easing.easeInOut,
      }),
      [theme.breakpoints.up("mobile")]: {
         paddingTop: ({ focusModeEnabled }) => !focusModeEnabled && 65,
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
}))

const browserIsCompatible = AgoraRTC.checkSystemRequirements()
const ViewerLayout = (props) => {
   const { children, isBreakout } = props
   const firebase = useFirebaseService()
   const {
      query: { livestreamId, breakoutRoomId, token, isRecordingWindow },
      replace,
      asPath,
   } = useRouter()
   const channelId = breakoutRoomId || livestreamId
   const dispatch = useDispatch()
   const { authenticatedUser, userData } = useAuth()
   const {
      breakpoints: { values },
   } = useTheme()
   const mobile = useMediaQuery(`(max-width:${values.mobile}px)`)
   const streamRef = useStreamRef()
   const [audienceDrawerOpen, setAudienceDrawerOpen] = useState(false)
   const [handRaiseActive, setHandRaiseActive] = useState(false)
   const [streamerId, setStreamerId] = useState("")
   const showMenu = useSelector(leftMenuOpenSelector)

   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const spyModeEnabled = useSelector(
      (state) => state.stream.streaming.spyModeEnabled
   )
   const classes = useStyles({ showMenu, mobile, focusModeEnabled })
   const [selectedState, setSelectedState] = useState("questions")
   const [notAuthorized, setNotAuthorized] = useState(false)
   const [checkingForCategoryData, setCheckingForCategoryData] = useState(false)
   const [
      hasAnsweredLivestreamGroupQuestions,
      setHasAnsweredLivestreamGroupQuestions,
   ] = useState(false)
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined)
   const handleOpenJoinModal = ({ groups, livestream }) =>
      setJoinGroupModalData({ groups, livestream })
   const handleCloseJoinModal = () => setJoinGroupModalData(undefined)
   const currentLivestream = useStreamConnect()
   const handRaiseId =
      (currentLivestream?.test || currentLivestream?.openStream) &&
      !authenticatedUser?.email
         ? "anonymous" + streamerId
         : authenticatedUser.email

   const shouldInitializeAgora = Boolean(
      currentLivestream?.hasStarted || (userData?.isAdmin && spyModeEnabled)
   )

   useStreamerActiveHandRaisesConnect({ withAll: true })

   useEffect(() => {
      if (currentLivestream && !currentLivestream.test) {
         if (currentLivestream.openStream) {
            setNotAuthorized(false)
         } else {
            if (token) {
               firebase
                  .getLivestreamSecureTokenWithRef(streamRef)
                  .then((doc) => {
                     if (!doc.exists) {
                        router.push("/streaming/error")
                     }
                     let storedToken = doc.data().value
                     if (storedToken !== token) {
                        setNotAuthorized(false)
                     }
                  })
            } else {
               setNotAuthorized(
                  currentLivestream &&
                     !currentLivestream.test &&
                     authenticatedUser?.isLoaded &&
                     authenticatedUser?.isEmpty
               )
            }
         }
      }
   }, [token, currentLivestream?.test, currentLivestream?.id])

   useEffect(() => {
      if (Boolean(isRecordingWindow)) {
         dispatch(actions.setFocusMode(true, mobile))
      }
   }, [isRecordingWindow])

   useEffect(() => {
      if (mobile || currentLivestream?.questionsDisabled) {
         closeLeftMenu()
      } else {
         if (!focusModeEnabled) {
            openLeftMenu()
         }
      }
   }, [mobile, currentLivestream?.questionsDisabled])

   useEffect(() => {
      // if (userData?.isAdmin) return
      if (userData?.userEmail) {
         if (
            (livestreamId && hasAnsweredLivestreamGroupQuestions) ||
            breakoutRoomId
         ) {
            console.log("-> SETTING PARTICIPATION")
            void firebase.setUserIsParticipatingWithRef(streamRef, userData)
         }
      }
   }, [
      livestreamId,
      userData?.userEmail,
      userData?.isAdmin,
      userData?.linkedinUrl,
      userData?.firstName,
      userData?.lastName,
      userData?.registeredGroups,
      breakoutRoomId,
      streamRef,
      hasAnsweredLivestreamGroupQuestions,
   ])

   useEffect(() => {
      if (currentLivestream && !streamerId) {
         if (currentLivestream.test && authenticatedUser?.email) {
            setStreamerId(currentLivestream.id + authenticatedUser.email)
         } else if (currentLivestream.test || currentLivestream.openStream) {
            let uuid = uuidv4()
            let joiningId = uuid.replace(/-/g, "")
            setStreamerId(currentLivestream.id + joiningId)
         } else if (authenticatedUser?.email) {
            setStreamerId(currentLivestream.id + authenticatedUser.email)
         } else if (isRecordingWindow) {
            setStreamerId(uuidv4())
         }
      }
   }, [
      currentLivestream?.test,
      currentLivestream?.id,
      authenticatedUser?.email,
   ])

   useEffect(() => {
      if (currentLivestream?.hasStarted || spyModeEnabled) {
         dispatch(actions.unmuteAllRemoteVideos())
      } else {
         dispatch(actions.muteAllRemoteVideos())
      }
   }, [currentLivestream?.hasStarted, spyModeEnabled])

   useEffect(() => {
      const checkForCategoryData = async () => {
         try {
            if (
               userData &&
               !currentLivestream?.test &&
               currentLivestream?.groupQuestionsMap &&
               !breakoutRoomId
            ) {
               setCheckingForCategoryData(true)

               const livestreamGroups = await firebase.getGroupsWithIds(
                  currentLivestream.groupIds
               )

               const [{ hasAgreedToAll }, answeredLivestreamGroupQuestions] =
                  await Promise.all([
                     GroupsUtil.getPolicyStatus(
                        livestreamGroups,
                        userData.userEmail,
                        firebase.checkIfUserAgreedToGroupPolicy
                     ),
                     groupRepo.mapUserAnswersToLivestreamGroupQuestions(
                        userData,
                        currentLivestream
                     ),
                  ])

               /*
                * Here we check if the user has answered all the questions for the livestream
                * by looking at the user's answers and the livestreams questions in userData/userGroups
                * */
               const hasAnsweredAllQuestions =
                  checkIfUserHasAnsweredAllLivestreamGroupQuestions(
                     answeredLivestreamGroupQuestions
                  )

               // The user might have answered all the questions but not registered to the event,
               // so we check if the user has registered to the event
               const hasRegisteredToEvent =
                  currentLivestream?.registeredUsers?.includes?.(
                     userData.userEmail
                  )

               if (
                  !hasAnsweredAllQuestions || // if the user has not answered all the event questions
                  !hasRegisteredToEvent || // if the user has not registered to the event
                  !hasAgreedToAll // if the user has not agreed to all the policies
               ) {
                  // we show the registration modal
                  handleOpenJoinModal({
                     groups: livestreamGroups,
                     livestream: currentLivestream,
                  })
               } else setHasAnsweredLivestreamGroupQuestions(true)
            }
         } catch (e) {
            errorLogAndNotify(e)
         }
         setCheckingForCategoryData(false)
      }

      void checkForCategoryData()
   }, [Boolean(userData), Boolean(currentLivestream)])

   const onRegistrationQuestionsAnswered = useCallback(async () => {
      setHasAnsweredLivestreamGroupQuestions(true)
      handleCloseJoinModal()
   }, [])

   useRewardLivestreamAttendance(currentLivestream)
   useCountLivestreamAttendanceMinutes(currentLivestream)

   if (notAuthorized) {
      replace({
         pathname: `/login`,
         query: { absolutePath: asPath },
      })
   }

   const closeLeftMenu = () => dispatch(actions.closeLeftMenu())
   const openLeftMenu = () => dispatch(actions.openLeftMenu())

   const handleStateChange = useCallback(
      (state) => {
         if (!showMenu) {
            openLeftMenu()
         }
         setSelectedState(state)
      },
      [showMenu]
   )

   const showAudience = useCallback(() => {
      setAudienceDrawerOpen(true)
      dataLayerEvent("livestream_viewer_show_audience_tab")
   }, [])

   const hideAudience = useCallback(() => {
      setAudienceDrawerOpen(false)
   }, [])

   const currentStreamContextValue = useMemo(
      () => ({
         currentLivestream,
         isBreakout,
         streamerId,
         isStreamer: false,
         handRaiseId,
         isMobile: mobile,
         selectedState,
      }),
      [
         currentLivestream,
         isBreakout,
         streamerId,
         handRaiseId,
         mobile,
         selectedState,
      ]
   )
   if (!browserIsCompatible) {
      return <BrowserIncompatibleOverlay />
   }

   if (
      !isLoaded(currentLivestream) ||
      notAuthorized ||
      checkingForCategoryData ||
      !streamerId
   ) {
      return <Loader />
   }

   if (joinGroupModalData) {
      return (
         <ViewerGroupCategorySelectMenu
            joinGroupModalData={joinGroupModalData}
            onQuestionsAnswered={onRegistrationQuestionsAnswered}
         />
      )
   }

   return (
      <RTCProvider
         uid={streamerId}
         channel={channelId}
         appId={agoraCredentials.appID}
         initialize={shouldInitializeAgora}
         screenSharerId={currentLivestream?.screenSharerId}
         streamMode={currentLivestream?.mode}
         isStreamer={handRaiseActive}
      >
         <RTMProvider
            livestreamId={livestreamId}
            roomId={currentLivestream.id}
            userId={streamerId}
         >
            <CurrentStreamContext.Provider value={currentStreamContextValue}>
               <div className={`${classes.root} notranslate`}>
                  <ViewerTopBar
                     showAudience={showAudience}
                     showMenu={showMenu}
                     audienceDrawerOpen={audienceDrawerOpen}
                     mobile={mobile}
                  />
                  <LeftMenu
                     streamerId={streamerId}
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
                              showMenu,
                              hideAudience,
                              audienceDrawerOpen,
                           })}
                        </div>
                     </div>
                  </div>
               </div>
            </CurrentStreamContext.Provider>
         </RTMProvider>
      </RTCProvider>
   )
}

ViewerLayout.propTypes = {
   children: PropTypes.node.isRequired,
}

export default ViewerLayout
