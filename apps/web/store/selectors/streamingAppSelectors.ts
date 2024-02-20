import { type UID } from "agora-rtc-react"
import { type RootState } from "store"

export const activeViewSelector = (state: RootState) =>
   state.streamingApp.sidePanel.activeView

export const isHostSelector = (state: RootState) => state.streamingApp.isHost

export const viewCountSelector = (state: RootState) =>
   state.streamingApp.topBar.viewCount

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
