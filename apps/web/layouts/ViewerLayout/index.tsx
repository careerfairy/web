import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import { Box, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import AgoraRTC from "agora-rtc-sdk-ng"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { appendCurrentQueryParams } from "components/util/url"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import RTMProvider from "context/agora/RTMProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { isLoaded } from "react-redux-firebase"
import * as actions from "store/actions"
import { AnalyticsEvents } from "util/analyticsConstants"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "../../HOCs/AuthProvider"
import useCountLivestreamAttendanceMinutes from "../../components/custom-hook/useCountLivestreamAttendanceMinutes"
import useRewardLivestreamAttendance from "../../components/custom-hook/useRewardLivestreamAttendance"
import useStreamConnect from "../../components/custom-hook/useStreamConnect"
import useStreamRef from "../../components/custom-hook/useStreamRef"
import useStreamerActiveHandRaisesConnect from "../../components/custom-hook/useStreamerActiveHandRaisesConnect"
import { checkIfUserHasAnsweredAllLivestreamGroupQuestions } from "../../components/views/common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import Loader from "../../components/views/loader/Loader"
import BrowserIncompatibleOverlay from "../../components/views/streaming/BrowserIncompatibleOverlay"
import LeftMenu from "../../components/views/viewer/LeftMenu/LeftMenu"
import { LEFT_MENU_WIDTH } from "../../constants/streams"
import RTCProvider from "../../context/agora/RTCProvider"
import {
   CurrentStreamContext,
   CurrentStreamContextInterface,
} from "../../context/stream/StreamContext"
import { groupRepo } from "../../data/RepositoryInstances"
import { agoraCredentials } from "../../data/agora/AgoraInstance"
import GroupsUtil from "../../data/util/GroupsUtil"
import { RootState } from "../../store"
import {
   focusModeEnabledSelector,
   leftMenuOpenSelector,
   rtcConnectionStateSelector,
} from "../../store/selectors/streamSelectors"
import { sxStyles } from "../../types/commonTypes"
import { errorLogAndNotify } from "../../util/CommonUtil"
import { dataLayerEvent } from "../../util/analyticsUtils"
import ViewerTopBar from "./ViewerTopBar"

const styles = sxStyles({
   root: {
      position: "relative",
      "& ::-webkit-scrollbar": {
         width: "3px",
         backgroundColor: "transparent",
         borderRadius: 1,
      },
      "& ::-webkit-scrollbar-thumb": {
         borderRadius: 1,
         WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,.3)",
         backgroundColor: "text.secondary",
      },
      height: "100vh",
      width: "100%",
      touchAction: "manipulation",
      display: "flex",
      overflow: "hidden",
   },
   wrapper: (theme) => ({
      display: "flex",
      flex: "1 1 auto",
      overflow: "hidden",
      paddingTop: {
         mobile: "65px",
      },
      transition: theme.transitions.create("padding-left", {
         duration: theme.transitions.duration.shortest,
         easing: theme.transitions.easing.easeInOut,
      }),
   }),
   wrapperDesktopMenuOpen: {
      pl: `${LEFT_MENU_WIDTH}px`,
   },
   wrapperFocusMode: {
      pt: {
         mobile: "0",
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
      background: "black",
      position: "relative",
      overflow: "auto",
   },
})

const browserIsCompatible = AgoraRTC.checkSystemRequirements()
const ViewerLayout = (props) => {
   const { children, isBreakout } = props
   const firebase = useFirebaseService()
   const {
      query: { livestreamId, breakoutRoomId, token, isRecordingWindow },
      replace,
      push,
      asPath,
   } = useRouter()
   const channelId = breakoutRoomId || livestreamId
   const dispatch = useDispatch()
   const { authenticatedUser, userData, userStats } = useAuth()
   const {
      breakpoints: { values },
   } = useTheme()
   const mobile = useMediaQuery(`(max-width:${values.mobile}px)`)
   const streamRef = useStreamRef()
   const [audienceDrawerOpen, setAudienceDrawerOpen] = useState(false)
   const [handRaiseActive, setHandRaiseActive] = useState(false)
   const [streamerId, setStreamerId] = useState("")
   const showMenu = useSelector(leftMenuOpenSelector)
   const hasRegisteredToEvent = useUserIsRegistered(livestreamId as string)

   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const spyModeEnabled = useSelector(
      (state: RootState) => state.stream.streaming.spyModeEnabled
   )
   const desktopMenuOpen = showMenu && !mobile
   const [selectedState, setSelectedState] =
      useState<CurrentStreamContextInterface["selectedState"]>("questions")
   const [notAuthorized, setNotAuthorized] = useState(false)
   const [checkingForCategoryData, setCheckingForCategoryData] = useState(false)
   const [
      hasAnsweredLivestreamGroupQuestions,
      setHasAnsweredLivestreamGroupQuestions,
   ] = useState(false)

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

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
                        void push("/streaming/error")
                     }
                     const storedToken = doc.data().value
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [token, currentLivestream?.test, currentLivestream?.id])

   useEffect(() => {
      // eslint-disable-next-line no-extra-boolean-cast
      if (Boolean(isRecordingWindow)) {
         void dispatch(actions.setFocusMode(true, mobile))
      }
   }, [dispatch, isRecordingWindow, mobile])

   useEffect(() => {
      if (mobile || currentLivestream?.questionsDisabled) {
         void closeLeftMenu()
      } else {
         if (!focusModeEnabled) {
            void openLeftMenu()
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [mobile, currentLivestream?.questionsDisabled])

   useEffect(() => {
      // if (userData?.isAdmin) return
      if (userData?.userEmail) {
         if (
            (livestreamId && hasAnsweredLivestreamGroupQuestions) ||
            breakoutRoomId
         ) {
            void firebase.setUserIsParticipatingWithRef(
               streamRef,
               userData,
               userStats
            )
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const uuid = uuidv4()
            const joiningId = uuid.replace(/-/g, "")
            setStreamerId(currentLivestream.id + joiningId)
         } else if (authenticatedUser?.email) {
            setStreamerId(currentLivestream.id + authenticatedUser.email)
         } else if (isRecordingWindow) {
            setStreamerId(uuidv4())
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      currentLivestream?.test,
      currentLivestream?.id,
      authenticatedUser?.email,
   ])

   useEffect(() => {
      if (currentLivestream?.hasStarted || spyModeEnabled) {
         void dispatch(actions.unmuteAllRemoteVideos())
      } else {
         void dispatch(actions.muteAllRemoteVideos())
      }
   }, [currentLivestream?.hasStarted, dispatch, spyModeEnabled])

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

               if (
                  !hasAnsweredAllQuestions || // if the user has not answered all the event questions
                  !hasRegisteredToEvent || // if the user has not registered to the event
                  !hasAgreedToAll // if the user has not agreed to all the policies
               ) {
                  // we show the registration modal
                  handleOpenDialog()
               } else setHasAnsweredLivestreamGroupQuestions(true)
            }
         } catch (e) {
            errorLogAndNotify(e)
         }
         setCheckingForCategoryData(false)
      }

      void checkForCategoryData()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [Boolean(userData), Boolean(currentLivestream)])

   const onRegistrationQuestionsAnswered = useCallback(async () => {
      setHasAnsweredLivestreamGroupQuestions(true)
      handleCloseDialog()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const agoraRtcConnectionStatus = useSelector(rtcConnectionStateSelector)

   useRewardLivestreamAttendance(currentLivestream)
   useCountLivestreamAttendanceMinutes(
      currentLivestream,
      agoraRtcConnectionStatus.curState,
      agoraRtcConnectionStatus.reason,
      isBreakout
   )

   useConditionalRedirect(
      // Do not redirect to new UI if the current stream is a breakout room, as we don't support the new UI for breakout rooms
      isBreakout ? false : currentLivestream && !currentLivestream?.useOldUI,
      appendCurrentQueryParams(`/streaming/viewer/${livestreamId}`)
   )

   if (notAuthorized) {
      void replace({
         pathname: `/login`,
         query: { absolutePath: asPath },
      })
   }

   const closeLeftMenu = () => dispatch(actions.closeLeftMenu())
   const openLeftMenu = useCallback(
      () => dispatch(actions.openLeftMenu()),
      [dispatch]
   )

   const handleStateChange = useCallback(
      (state) => {
         if (!showMenu) {
            void openLeftMenu()
         }
         setSelectedState(state)
      },
      [openLeftMenu, showMenu]
   )

   const showAudience = useCallback(() => {
      setAudienceDrawerOpen(true)
      dataLayerEvent(AnalyticsEvents.LivestreamViewerShowAudienceTab)
   }, [])

   const hideAudience = useCallback(() => {
      setAudienceDrawerOpen(false)
   }, [])

   const currentStreamContextValue = useMemo<CurrentStreamContextInterface>(
      () => ({
         currentLivestream,
         isBreakout,
         streamerId,
         isStreamer: false,
         isMainStreamer: false,
         handRaiseId,
         isMobile: mobile,
         selectedState,
         presenter: currentLivestream
            ? LivestreamPresenter.createFromDocument(currentLivestream)
            : null,
         streamAdminPreferences: null,
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

   if (isDialogOpen) {
      return (
         <LivestreamDialog
            open={isDialogOpen}
            updatedStats={null}
            serverUserEmail={null}
            serverSideLivestream={currentLivestream}
            livestreamId={currentLivestream.id}
            handleClose={() => {}}
            initialPage={"register"}
            mode="stand-alone"
            onRegisterSuccess={onRegistrationQuestionsAnswered}
         />
      )
   }

   return (
      <RTCProvider
         uid={streamerId}
         channel={channelId.toString()}
         appId={agoraCredentials.appID}
         screenSharerId={currentLivestream?.screenSharerId}
         streamMode={currentLivestream?.mode}
         isStreamer={handRaiseActive}
         allowViewerToJoin={
            currentLivestream?.hasStarted ||
            currentLivestream?.test === true ||
            spyModeEnabled
         }
      >
         <RTMProvider
            livestreamId={livestreamId as string}
            roomId={currentLivestream.id}
            userId={streamerId}
         >
            <CurrentStreamContext.Provider value={currentStreamContextValue}>
               <Box sx={styles.root} className={`notranslate`}>
                  <ViewerTopBar
                     showAudience={showAudience}
                     showMenu={showMenu}
                     audienceDrawerOpen={audienceDrawerOpen}
                     mobile={mobile}
                  />
                  <LeftMenu
                     streamFinished={currentStreamContextValue.presenter?.streamHasFinished()}
                     handRaiseActive={handRaiseActive}
                     setHandRaiseActive={setHandRaiseActive}
                     streamer={false}
                     selectedState={selectedState}
                     setSelectedState={setSelectedState}
                     livestream={currentLivestream}
                     isMobile={mobile}
                  />

                  <Box
                     sx={[
                        styles.wrapper,
                        focusModeEnabled && styles.wrapperFocusMode,
                        desktopMenuOpen && styles.wrapperDesktopMenuOpen,
                     ]}
                  >
                     <Box sx={styles.contentContainer}>
                        <Box sx={styles.content}>
                           {React.cloneElement(children, {
                              handRaiseActive,
                              handleStateChange,
                              selectedState,
                              showMenu,
                              hideAudience,
                              audienceDrawerOpen,
                           })}
                        </Box>
                     </Box>
                  </Box>
               </Box>
            </CurrentStreamContext.Provider>
         </RTMProvider>
      </RTCProvider>
   )
}

export default ViewerLayout
