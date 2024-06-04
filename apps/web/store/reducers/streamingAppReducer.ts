import {
   EmoteType,
   LivestreamMode,
   LivestreamModes,
} from "@careerfairy/shared-lib/livestreams"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import {
   ConnectionDisconnectedReason,
   ConnectionState,
   type UID,
} from "agora-rtc-react"
import { RtmStatusCode } from "agora-rtm-sdk"
import { VirtualBackgroundMode } from "components/views/streaming-page/types"
import { errorLogAndNotify } from "util/CommonUtil"
import { v4 as uuidv4 } from "uuid"

/** Max number of emote nodes that can be rendered at once */
const MAX_EMOTES_TO_RENDER = 30

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
   uploadPDFPresentationDialogOpen: boolean
   shareVideoDialogOpen: boolean
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
      /* number of new hand raises since the stream enabled hand raise */
      numberOfHandRaiseNotifications: number
      startsAt: number | null
      startedAt: number | null
      /**
       * Indicates the streaming state:
       * - `undefined`: The stream has never been started.
       * - `false`: The stream has ended.
       * - `true`: The stream was restarted.
       */
      hasStarted: boolean | undefined
      hasEnded: boolean
      openStream: boolean
      companyLogoUrl: string
      companyName: string
      handRaiseEnabled: boolean
      hasJobs: boolean
      test: boolean
   } | null
   rtmSignalingState: {
      failedToConnect: boolean
      viewCount: number
      connectionState: {
         state: RtmStatusCode.ConnectionState
         reason: RtmStatusCode.ConnectionChangeReason
      } | null
   }
   rtcState: {
      connectionState: {
         currentState: ConnectionState
         prevState: ConnectionState
         reason: ConnectionDisconnectedReason
      } | null
   }
   emotes: {
      type: EmoteType
      id: string
   }[]
   virtualBackgroundMode: VirtualBackgroundMode
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
   uploadPDFPresentationDialogOpen: false,
   shareVideoDialogOpen: false,
   audioLevels: {},
   livestreamState: {
      mode: LivestreamModes.DEFAULT,
      screenSharerId: null,
      numberOfParticipants: 0,
      startsAt: null,
      startedAt: null,
      hasStarted: false,
      hasEnded: false,
      openStream: false,
      companyLogoUrl: "",
      companyName: "",
      handRaiseEnabled: false,
      numberOfHandRaiseNotifications: 0,
      hasJobs: false,
      test: false,
   },
   rtmSignalingState: {
      failedToConnect: false,
      viewCount: 0,
      connectionState: null,
   },
   rtcState: {
      connectionState: null,
   },
   emotes: [],
   virtualBackgroundMode: VirtualBackgroundMode.OFF,
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
      openPolls(state) {
         state.sidePanel.activeView = ActiveViews.POLLS
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
      setStartsAt(state, action: PayloadAction<number | null>) {
         if (state.livestreamState.startsAt !== action.payload) {
            state.livestreamState.startsAt = action.payload
         }
      },
      setStarted(
         state,
         action: PayloadAction<
            Pick<
               StreamingAppState["livestreamState"],
               "startedAt" | "hasStarted"
            >
         >
      ) {
         state.livestreamState.startedAt = action.payload.startedAt
         state.livestreamState.hasStarted = action.payload.hasStarted
      },
      setHasEnded(state, action: PayloadAction<boolean>) {
         if (state.livestreamState.hasEnded !== action.payload) {
            state.livestreamState.hasEnded = action.payload
         }
      },
      setScreenSharerId(state, action: PayloadAction<string | null>) {
         state.livestreamState.screenSharerId = action.payload
      },
      setOpenStream(state, action: PayloadAction<boolean>) {
         state.livestreamState.openStream = action.payload
      },
      setCompanyLogoUrl(state, action: PayloadAction<string>) {
         state.livestreamState.companyLogoUrl = action.payload
      },
      setTest(state, action: PayloadAction<boolean>) {
         state.livestreamState.test = action.payload
      },
      setCompanyName(state, action: PayloadAction<string>) {
         state.livestreamState.companyName = action.payload
      },
      setHandRaiseEnabled(state, action: PayloadAction<boolean>) {
         if (state.livestreamState.handRaiseEnabled !== action.payload) {
            // Reset the number of new hand raises to zero when the hand raise is toggled
            state.livestreamState.numberOfHandRaiseNotifications = 0
         }
         state.livestreamState.handRaiseEnabled = action.payload
      },
      incrementNumberOfHandRaiseNotifications(
         state,
         action: PayloadAction<number>
      ) {
         // Increment/Decrement the number of new hand raise notifications by the given amount, min zero
         state.livestreamState.numberOfHandRaiseNotifications = Math.max(
            0,
            state.livestreamState.numberOfHandRaiseNotifications +
               action.payload
         )
      },
      resetNumberOfHandRaiseNotifications(state) {
         state.livestreamState.numberOfHandRaiseNotifications = 0
      },
      resetLivestreamState(state) {
         state.livestreamState = initialState.livestreamState
      },
      toggleSettingsMenu(state) {
         state.settingsMenu.isOpen = !state.settingsMenu.isOpen
      },
      setHasJobs(state, action: PayloadAction<boolean>) {
         state.livestreamState.hasJobs = action.payload
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
         if (action.payload) {
            const { reason, state: rtmState } = action.payload

            if (reason === "REMOTE_LOGIN" && rtmState === "ABORTED") {
               errorLogAndNotify(
                  new Error("RTM - User is logged in on a different browser"),
                  { reason, rtmState }
               )
               state.isLoggedInOnDifferentBrowser = true
            }
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
         if (action.payload) {
            const { reason, currentState, prevState } = action.payload

            if (reason === "UID_BANNED") {
               errorLogAndNotify(new Error("RTC - User is banned"), {
                  reason,
                  currentState,
                  prevState,
               })
               state.isLoggedInOnDifferentBrowser = true
            }
         }
      },

      setUploadPDFPresentationDialogOpen(
         state,
         action: PayloadAction<boolean>
      ) {
         state.uploadPDFPresentationDialogOpen = action.payload
      },
      setShareVideoDialogOpen(state, action: PayloadAction<boolean>) {
         state.shareVideoDialogOpen = action.payload
      },
      addEmote(state, action: PayloadAction<EmoteType>) {
         if (state.emotes.length >= MAX_EMOTES_TO_RENDER) {
            state.emotes.shift()
         }
         state.emotes.push({ type: action.payload, id: uuidv4() })
      },
      removeEmote(state, action: PayloadAction<string>) {
         state.emotes = state.emotes.filter(
            (emote) => emote.id !== action.payload
         )
      },
      clearEmotes(state) {
         state.emotes = []
      },

      /* ==========================
         ||   Virtual Background   ||
         ========================== */
      setVirtualBackgroundMode(
         state,
         action: PayloadAction<VirtualBackgroundMode>
      ) {
         state.virtualBackgroundMode = action.payload
      },
   },
})

export const {
   actions: {
      setLivestreamMode,
      setScreenSharerId,
      setNumberOfParticipants,
      setStarted,
      setStartsAt,
      setHasEnded,
      setOpenStream,
      setCompanyLogoUrl,
      setTest,
      setCompanyName,
      resetLivestreamState,
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
      openPolls,
      setHandRaiseEnabled,
      setHasJobs,
      incrementNumberOfHandRaiseNotifications,
      resetNumberOfHandRaiseNotifications,
      setUploadPDFPresentationDialogOpen,
      setShareVideoDialogOpen,
      addEmote,
      removeEmote,
      clearEmotes,
      setVirtualBackgroundMode,
   },
   reducer: streamingAppReducer,
} = streamingAppSlice
