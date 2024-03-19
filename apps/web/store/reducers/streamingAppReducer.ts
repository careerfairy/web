import {
   LivestreamMode,
   LivestreamModes,
} from "@careerfairy/shared-lib/livestreams"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
   ConnectionDisconnectedReason,
   ConnectionState,
   type UID,
} from "agora-rtc-react"
import { RtmStatusCode } from "agora-rtm-sdk"

export const ActiveViews = {
   CHAT: "chat",
   POLLS: "polls",
   QUESTIONS: "questions",
   JOBS: "jobs",
   CTA: "cta",
   HAND_RAISE: "handRaise",
   VIEWERS: "viewers",
} as const

export const StreamLayouts = {
   /**
    * Represents a layout where the focus is on a specific content or person, such as when a desktop is being shared,
    * a video is played, or a presentation is being shown.
    */
   SPOTLIGHT: "spotlight",
   /**
    * Represents a layout where multiple participants' streams are displayed equally, typically in a grid format.
    * This is the default view when no specific content is being highlighted.
    */
   GALLERY: "gallery",
} as const

export type StreamLayout = (typeof StreamLayouts)[keyof typeof StreamLayouts]

export type ActiveView = (typeof ActiveViews)[keyof typeof ActiveViews]

export interface StreamingAppState {
   sidePanel: {
      isOpen: boolean
      activeView: ActiveView
   }
   isHost: boolean
   streamLayout: StreamLayout
   settingsMenu: {
      isOpen: boolean
   }
   /**
    * A mapping from user IDs to objects containing their current audio levels and the timestamp when their audio level was last above 60.
    * Audio levels are represented as integers ranging from 0 to 100.
    */
   audioLevels: {
      [key in UID]: {
         level: number
         lastSpokeAt: number | null
      }
   }
   livestreamState: {
      screenSharerId: string
      mode: LivestreamMode
      numberOfParticipants: number
      startedAt: number | null
      hasStarted: boolean
   }
   rtmSignalingState: {
      failedToConnect: boolean
      viewCount: number
      connectionState: {
         state: RtmStatusCode.ConnectionState
         reason: RtmStatusCode.ConnectionChangeReason
      }
   }
   rtcState: {
      connectionState?: {
         currentState: ConnectionState
         prevState: ConnectionState
         reason: ConnectionDisconnectedReason
      }
   }
   isLoggedInOnDifferentBrowser: boolean
}

const initialState: StreamingAppState = {
   sidePanel: {
      isOpen: false,
      activeView: ActiveViews.CHAT, // 'chat', 'polls', 'questions', etc.
   },
   isHost: false,
   streamLayout: StreamLayouts.GALLERY,
   settingsMenu: {
      isOpen: false,
   },
   audioLevels: {},
   livestreamState: {
      mode: LivestreamModes.DEFAULT,
      screenSharerId: null,
      numberOfParticipants: 0,
      startedAt: null,
      hasStarted: false,
   },
   rtmSignalingState: {
      failedToConnect: false,
      viewCount: 0,
      connectionState: null,
   },
   rtcState: {
      connectionState: null,
   },
   isLoggedInOnDifferentBrowser: false,
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
         action.payload.forEach(({ uid, level }) => {
            state.audioLevels[uid] = {
               level,
               lastSpokeAt:
                  level > 60
                     ? Date.now()
                     : state.audioLevels[uid]?.lastSpokeAt || null,
            }
         })
      },
      setLivestreamMode(state, action: PayloadAction<LivestreamMode>) {
         state.livestreamState.mode = action.payload

         const shouldBeSpotlight = [
            LivestreamModes.DESKTOP,
            LivestreamModes.VIDEO,
            LivestreamModes.PRESENTATION,
         ].some((mode) => mode === action.payload)

         if (shouldBeSpotlight) {
            state.streamLayout = StreamLayouts.SPOTLIGHT
         } else {
            state.streamLayout = StreamLayouts.GALLERY
         }
      },
      setNumberOfParticipants(state, action: PayloadAction<number>) {
         state.livestreamState.numberOfParticipants = action.payload
      },
      setStartedAt(state, action: PayloadAction<number | null>) {
         if (state.livestreamState.startedAt !== action.payload) {
            state.livestreamState.startedAt = action.payload
         }
      },
      setHasStarted(state, action: PayloadAction<boolean>) {
         if (state.livestreamState.hasStarted !== action.payload) {
            state.livestreamState.hasStarted = action.payload
         }
      },
      setScreenSharerId(state, action: PayloadAction<string | null>) {
         state.livestreamState.screenSharerId = action.payload
      },
      toggleSettingsMenu(state) {
         state.settingsMenu.isOpen = !state.settingsMenu.isOpen
      },

      /* ==========================
         ||   Signaling State   ||
         ========================== */
      setRTMFailedToConnect(state, action: PayloadAction<boolean>) {
         state.rtmSignalingState.failedToConnect = action.payload
      },
      setViewCount(state, action: PayloadAction<number>) {
         state.rtmSignalingState.viewCount = action.payload
      },
      setRTMConnectionState(
         state,
         action: PayloadAction<
            StreamingAppState["rtmSignalingState"]["connectionState"]
         >
      ) {
         state.rtmSignalingState.connectionState = action.payload
         const { reason, state: rtmState } = action.payload

         if (reason === "REMOTE_LOGIN" && rtmState === "ABORTED") {
            state.isLoggedInOnDifferentBrowser = true
         }
      },

      /* ==========================
         ||   RTC State   ||
         ========================== */
      setRTCConnectionState(
         state,
         action: PayloadAction<StreamingAppState["rtcState"]["connectionState"]>
      ) {
         state.rtcState.connectionState = action.payload
         const { reason } = action.payload

         if (reason === "UID_BANNED") {
            state.isLoggedInOnDifferentBrowser = true
         }
      },
   },
})

export const {
   actions: {
      setLivestreamMode,
      setScreenSharerId,
      setNumberOfParticipants,
      setStartedAt,
      setHasStarted,
      toggleSidePanel,
      closeSidePanel,
      setActiveView,
      setHostStatus,
      setViewCount,
      setAudioLevels,
      toggleSettingsMenu,
      setRTMFailedToConnect,
      setRTMConnectionState,
      setRTCConnectionState,
   },
   reducer: streamingAppReducer,
} = streamingAppSlice
