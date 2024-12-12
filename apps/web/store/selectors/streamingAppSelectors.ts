import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { type UID } from "agora-rtc-react"
import { useAppSelector } from "components/custom-hook/store"
import { cfLogo } from "constants/images"
import { type RootState } from "store"
import { StreamLayouts } from "store/reducers/streamingAppReducer"

export const activeViewSelector = (state: RootState) =>
   state.streamingApp.sidePanel.activeView

export const isHostSelector = (state: RootState) => state.streamingApp.isHost

export const isSideDrawerOpenSelector = (state: RootState) =>
   state.streamingApp.sidePanel.isOpen

export const audioLevelsSelector = (state: RootState) =>
   state.streamingApp.audioLevels

export const userIsSpeakingSelector = (userId: UID) => (state: RootState) =>
   Boolean(state.streamingApp.audioLevels[userId]?.level > 60)

export const currentScreenSharerSelector = (state: RootState) =>
   state.streamingApp.livestreamState.screenSharerId

export const useSidePanel = () =>
   useAppSelector((state) => state.streamingApp.sidePanel)

export const useSettingsMenuOpen = () =>
   useAppSelector((state) => state.streamingApp.settingsMenu.isOpen)

export const useIsSpotlightMode = () =>
   useAppSelector(
      (state) => state.streamingApp.streamLayout === StreamLayouts.SPOTLIGHT
   )

export const useIsScreenShareMode = (): boolean =>
   useAppSelector(
      (state) =>
         state.streamingApp.livestreamState.mode === LivestreamModes.DESKTOP
   )

export const useLivestreamMode = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.mode)

export const useCurrentScreenSharer = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.screenSharerId)

export const useCurrentViewCount = () =>
   useAppSelector((state) => {
      if (state.streamingApp.rtmSignalingState.failedToConnect) {
         return state.streamingApp.livestreamState.numberOfParticipants
      }
      const viewCount = state.streamingApp.rtmSignalingState.viewCount
      return state.streamingApp.livestreamState.isRecordingBotInRoom
         ? viewCount - 1
         : viewCount
   })

export const useIsConnectedOnDifferentBrowser = () =>
   useAppSelector((state) => state.streamingApp.isLoggedInOnDifferentBrowser)

export const useFailedToConnectToRTM = () =>
   useAppSelector(
      (state) => state.streamingApp.rtmSignalingState.failedToConnect
   )

export const useHasStarted = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.hasStarted)

export const useStartedAt = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.startedAt)

export const useStartsAt = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.startsAt)

export const useHasEnded = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.hasEnded)

export const useOpenStream = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.openStream)

export const useCompanyLogoUrl = () =>
   useAppSelector((state) => {
      const { companyLogoUrl, test } = state.streamingApp.livestreamState
      return test ? cfLogo : companyLogoUrl
   })
export const useCompanyName = () =>
   useAppSelector((state) => {
      const { companyName, test } = state.streamingApp.livestreamState
      return test ? "Test Company" : companyName
   })

export const useStreamTitle = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.title)

export const useStreamHandRaiseEnabled = () =>
   useAppSelector(
      (state) => state.streamingApp.livestreamState.handRaiseEnabled
   )

export const useNumberOfHandRaiseNotifications = () =>
   useAppSelector(
      (state) =>
         state.streamingApp.livestreamState.numberOfHandRaiseNotifications
   )

export const useStreamHasJobs = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.hasJobs)

export const useUploadPDFPresentationDialogOpen = () =>
   useAppSelector((state) => state.streamingApp.uploadPDFPresentationDialogOpen)

export const useShareVideoDialogOpen = () =>
   useAppSelector((state) => state.streamingApp.shareVideoDialogOpen)

export const useDeniedPermissionsDialogOpen = () =>
   useAppSelector((state) => state.streamingApp.deniedPermissionsDialogOpen)

export const useEmotes = () =>
   useAppSelector((state) => state.streamingApp.emotes)

export const useVirtualBackgroundMode = () =>
   useAppSelector((state) => state.streamingApp.virtualBackgroundMode)

export const useShowWaitingRoom = (isHost: boolean) =>
   useAppSelector((state) => {
      const { hasStarted, hasEnded } = state.streamingApp.livestreamState
      const isSpyMode = state.streamingApp.isSpyMode

      return !isHost && !isSpyMode && !hasEnded && hasStarted === undefined
   })

export const useShowEndScreen = (isHost: boolean) =>
   useAppSelector((state) => {
      const { hasStarted, hasEnded } = state.streamingApp.livestreamState
      const isSpyMode = state.streamingApp.isSpyMode

      return !isHost && !isSpyMode && hasEnded && hasStarted === false
   })

export const useIsTestLivestream = () =>
   useAppSelector((state) => state.streamingApp.livestreamState.test)

export const useIsRecordingWindow = () =>
   useAppSelector(
      (state) => state.streamingApp.livestreamState.isRecordingWindow
   )

export const useIsRecordingBotInRoom = () =>
   useAppSelector(
      (state) => state.streamingApp.livestreamState.isRecordingBotInRoom
   )
export const useIsSpyMode = () =>
   useAppSelector((state) => state.streamingApp.isSpyMode)

export const useSpeakerId = () =>
   useAppSelector((state) => state.streamingApp.speakerId)

export const useUserUid = () =>
   useAppSelector((state) => state.streamingApp.userUid)

export const useAutoplayState = () =>
   useAppSelector((state) => state.streamingApp.autoplayState)

export const useRtcConnectionState = () =>
   useAppSelector((state) => state.streamingApp.rtcState.connectionState)
