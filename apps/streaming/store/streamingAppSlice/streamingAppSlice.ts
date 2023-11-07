import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type ActiveView = "chat" | "polls" | "quests" | null

export interface StreamingAppState {
   sidePanel: {
      isOpen: boolean
      activeView: ActiveView
   }
   isHost: boolean
   topBar: {
      viewCount: number
   }
}

const initialState: StreamingAppState = {
   sidePanel: {
      isOpen: false,
      activeView: null, // 'chat', 'polls', 'quests', etc.
   },
   isHost: false,
   topBar: {
      viewCount: 0, // hardcoded number for now
   },
}

const streamingAppSlice = createSlice({
   name: "streamingApp",
   initialState,
   reducers: {
      toggleSidePanel(state) {
         state.sidePanel.isOpen = !state.sidePanel.isOpen
      },
      setActiveView(state, action: PayloadAction<ActiveView>) {
         state.sidePanel.activeView = action.payload
         // Ensure the drawer opens when a new view is set
         state.sidePanel.isOpen = true
      },
      setHostStatus(state, action: PayloadAction<boolean>) {
         state.isHost = action.payload
      },
      incrementViewCount(state) {
         state.topBar.viewCount += 1
      },
      decrementViewCount(state) {
         state.topBar.viewCount -= 1
      },
      // Add other necessary actions here
   },
})

export const {
   actions: {
      toggleSidePanel,
      setActiveView,
      setHostStatus,
      incrementViewCount,
      decrementViewCount,
   },
   reducer: streamingAppReducer,
} = streamingAppSlice
