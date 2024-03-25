import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { type UID } from "agora-rtc-react"
import { useAppSelector } from "components/custom-hook/store"
import { type RootState } from "store"
import { StreamLayouts } from "store/reducers/streamingAppReducer"

export const activeViewSelector = (state: RootState) =>
   state.streamingApp.sidePanel.activeView

export const isHostSelector = (state: RootState) => state.streamingApp.isHost

export const isSideDrawerOpenSelector = (state: RootState) =>
   state.streamingApp.sidePanel.isOpen

export const sidePanelSelector = (state: RootState) =>
   state.streamingApp.sidePanel

export const audioLevelsSelector = (state: RootState) =>
   state.streamingApp.audioLevels

export const userIsSpeakingSelector = (userId: UID) => (state: RootState) =>
   Boolean(state.streamingApp.audioLevels[userId]?.level > 60)

export const currentScreenSharerSelector = (state: RootState) =>
   state.streamingApp.livestreamState.screenSharerId

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
      return state.streamingApp.rtmSignalingState.viewCount
   })
