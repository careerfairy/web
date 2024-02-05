import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { type UID } from "agora-rtc-react"

export const ActiveViews = {
   CHAT: "chat",
   POLLS: "polls",
   QUESTIONS: "questions",
   JOBS: "jobs",
   CTA: "cta",
   HAND_RAISE: "handRaise",
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
   /**
    * A mapping from user IDs to objects containing their current audio levels and the timestamp of the last update.
    * Audio levels are represented as integers ranging from 0 to 100.
    */
   audioLevels: Map<
      UID,
      {
         level: number
         lastUpdated: number
      }
   >
}

const initialState: StreamingAppState = {
   sidePanel: {
      isOpen: false,
      activeView: ActiveViews.CHAT, // 'chat', 'polls', 'questions', etc.
   },
   isHost: false,
   topBar: {
      viewCount: 0, // hardcoded number for now
   },
   audioLevels: new Map(),
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
      /**
       * Updates the audio levels of users.
       *
       * This reducer takes an array of objects, each containing a user ID (`uid`) and their corresponding audio level,
       * and updates the `audioLevels` state with these values. The audio levels are stored in a Map where the key is the user ID
       * and the value is the audio level.
       *
       * @param state The current state of the streaming app.
       * @param action The action payload containing an array of user audio levels.
       */
      setAudioLevels(
         state,
         action: PayloadAction<{ uid: UID; level: number }[]>
      ) {
         state.audioLevels = new Map(
            action.payload.map(({ uid, level }) => [
               uid,
               {
                  level,
                  lastUpdated: Date.now(),
               },
            ])
         )
      },
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
      setAudioLevels,
   },
   reducer: streamingAppReducer,
} = streamingAppSlice
