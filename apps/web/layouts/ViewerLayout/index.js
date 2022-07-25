import React, { useCallback, useEffect, useState } from "react"
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
import AgoraRTMProvider from "context/agoraRTM/AgoraRTMProvider"
import useStreamerActiveHandRaisesConnect from "../../components/custom-hook/useStreamerActiveHandRaisesConnect"
import AgoraRTC from "agora-rtc-sdk-ng"
import BrowserIncompatibleOverlay from "../../components/views/streaming/BrowserIncompatibleOverlay"
import useRewardLivestreamAttendance from "../../components/custom-hook/useRewardLivestreamAttendance"
import useCountLivestreamAttendanceMinutes from "../../components/custom-hook/useCountLivestreamAttendanceMinutes"
import { groupRepo } from "../../data/RepositoryInstances"
import { checkIfUserHasAnsweredAllLivestreamGroupQuestions } from "../../components/views/common/registration-modal/steps/LivestreamGroupQuestionForm/util"

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
}))

const ViewerLayout = (props) => {
   const [browserIsCompatible] = useState(AgoraRTC.checkSystemRequirements)
   const { children, isBreakout } = props
   const firebase = useFirebaseService()
   const {
      query: { livestreamId, breakoutRoomId, token, isRecordingWindow },
      replace,
      asPath,
   } = useRouter()
   const dispatch = useDispatch()
   const { authenticatedUser, userData } = useAuth()
   const {
      breakpoints: { values },
   } = useTheme()
   const mobile = useMediaQuery(`(max-width:${values.mobile}px)`)
   const streamRef = useStreamRef()
   const [audienceDrawerOpen, setAudienceDrawerOpen] = useState(false)
   const [handRaiseActive, setHandRaiseActive] = useState(false)
   const [streamerId, setStreamerId] = useState(null)
   const showMenu = useSelector((state) => state.stream.layout.leftMenuOpen)

   const focusModeEnabled = useSelector(
      (state) => state.stream.layout.focusModeEnabled
   )
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
      if (mobile) {
         closeLeftMenu()
      } else {
         if (!focusModeEnabled) {
            openLeftMenu()
         }
      }
   }, [mobile])

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
               !currentLivestream?.test &&
               currentLivestream?.groupQuestionsMap &&
               !breakoutRoomId
            ) {
               setCheckingForCategoryData(true)
               const livestreamGroups = await firebase.getGroupsWithIds(
                  currentLivestream.groupIds
               )
               const answeredLivestreamGroupQuestions =
                  await groupRepo.mapUserAnswersToLivestreamGroupQuestion(
                     userData,
                     currentLivestream
                  )
               const hasAnsweredAllQuestions =
                  checkIfUserHasAnsweredAllLivestreamGroupQuestions(
                     answeredLivestreamGroupQuestions
                  )
               if (!hasAnsweredAllQuestions) {
                  handleOpenJoinModal({
                     groups: livestreamGroups,
                     livestream: currentLivestream,
                  })
               } else setHasAnsweredLivestreamGroupQuestions(true)
            }
         } catch (e) {
            console.log("-> error in checkForCategoryData", e)
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
   }, [])

   const hideAudience = useCallback(() => {
      setAudienceDrawerOpen(false)
   }, [])

   if (!browserIsCompatible) {
      return <BrowserIncompatibleOverlay />
   }

   if (
      !isLoaded(currentLivestream) ||
      notAuthorized ||
      checkingForCategoryData
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
      <AgoraRTMProvider roomId={currentLivestream.id} userId={streamerId}>
         <CurrentStreamContext.Provider
            value={{
               currentLivestream,
               isBreakout,
               streamerId,
               isStreamer: false,
               handRaiseId,
               isMobile: mobile,
            }}
         >
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
      </AgoraRTMProvider>
   )
}

ViewerLayout.propTypes = {
   children: PropTypes.node.isRequired,
}

export default ViewerLayout
