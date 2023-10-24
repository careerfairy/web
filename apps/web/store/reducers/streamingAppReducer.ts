import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type ActiveView = "chat" | "polls" | "questions" | "support"

interface StreamingAppState {
   sidePanel: {
      isOpen: boolean
      activeView: ActiveView
   }
   isHost: boolean
   viewCount: number
}

const initialState: StreamingAppState = {
   sidePanel: {
      isOpen: false,
      activeView: null, // 'chat', 'polls', 'quests', etc.
   },
   isHost: false,
   viewCount: 0, // hardcoded number for now
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
      setHost(state, action: PayloadAction<boolean>) {
         state.isHost = action.payload
      },
      setViewCount(state, action: PayloadAction<number>) {
         state.viewCount = action.payload
      },
      // Add other necessary actions here
   },
})

export const { toggleSidePanel, setActiveView, setHost, setViewCount } =
   streamingAppSlice.actions

export default streamingAppSlice.reducer
