import { type RootState } from "store"

export const activeViewSelector = (state: RootState) =>
   state.streamingApp.sidePanel.activeView

export const isHostSelector = (state: RootState) => state.streamingApp.isHost

export const viewCountSelector = (state: RootState) =>
   state.streamingApp.topBar.viewCount

export const isSideDrawerOpenSelector = (state: RootState) =>
   state.streamingApp.sidePanel.isOpen

export const sideDrawerSelector = (state: RootState) =>
   state.streamingApp.sidePanel
