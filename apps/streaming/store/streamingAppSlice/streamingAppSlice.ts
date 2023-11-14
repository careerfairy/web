import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export const ActiveViews = {
   CHAT: "chat",
   POLLS: "polls",
   QUESTS: "quests",
   JOBS: "jobs",
   CTA: "cta",
   HAND_RAISE: "hand-raise",
} as const

export type ActiveView = (typeof ActiveViews)[keyof typeof ActiveViews]

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
      activeView: "chat", // 'chat', 'polls', 'quests', etc.
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
      closeSidePanel(state) {
         state.sidePanel.isOpen = false
      },
      setActiveView(state, action: PayloadAction<ActiveView>) {
         // if the view is already active, toggle the drawer
         if (action.payload === state.sidePanel.activeView) {
            state.sidePanel.isOpen = !state.sidePanel.isOpen
            return
         }

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
      closeSidePanel,
      setActiveView,
      setHostStatus,
      incrementViewCount,
      decrementViewCount,
   },
   reducer: streamingAppReducer,
} = streamingAppSlice
