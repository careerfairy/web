import {
   SparkCardNotificationTypes,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparkCategory } from "@careerfairy/shared-lib/sparks/sparks"
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { sparkService } from "data/firebase/SparksService"
import { type RootState } from "store"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"

type Status = "idle" | "loading" | "failed"

export enum AutomaticActions {
   APPLY = "apply"
}

export type AddCardNotificationPayload = {
   position?: number
   type: SparkCardNotificationTypes
}

// Initial state
interface SparksState {
   originalSparkId: string | null
   sparks: SparkPresenter[]
   currentPlayingIndex: number
   hasMoreSparks: boolean
   groupId: string | null
   userEmail: string | null
   numberOfSparksToFetch: number
   fetchNextSparksStatus: Status
   initialFetchStatus: Status
   initialSparksFetched: boolean
   fetchNextError: string | null
   initialFetchError: string | null
   eventNotification: UserSparksNotification | null
   sparkCategoryIds: SparkCategory["id"][]
   showEventDetailsDialog: boolean
   cardNotification: UserSparksNotification | null
   cameFromCompanyPageLink: string | null
   videosMuted: boolean
   playing: boolean
   eventToRegisterTo: string | null
   jobToOpen: string | null
   autoAction: AutomaticActions
   conversionCardInterval: number
   conversionCounter: number
}

const initialState: SparksState = {
   originalSparkId: null,
   sparks: [],
   currentPlayingIndex: 0,
   hasMoreSparks: true,
   groupId: null,
   userEmail: null,
   numberOfSparksToFetch: 10,
   initialFetchStatus: "loading",
   fetchNextSparksStatus: "idle",
   initialSparksFetched: false,
   fetchNextError: null,
   initialFetchError: null,
   sparkCategoryIds: [],
   eventNotification: null,
   showEventDetailsDialog: false,
   cardNotification: null,
   cameFromCompanyPageLink: null,
   videosMuted: true,
   playing: true,
   eventToRegisterTo: null,
   jobToOpen: null,
   autoAction: null
   conversionCardInterval: 0,
   conversionCounter: 0,
}

// Async thunk to fetch the next sparks
export const fetchNextSparks = createAsyncThunk(
   "sparks/fetchNext",
   async (_, { getState }) => {
      const state = getState() as RootState
      const { sparks, hasMoreSparks } = state.sparksFeed

      if (!hasMoreSparks) {
         return []
      }

      const lastSpark = sparks[sparks.length - 1]
      const sparkOptions = getSparkOptions(state)

      return sparkService.fetchNextSparks(lastSpark, sparkOptions)
   }
)
// Async thunk to fetch the next spark IDs
export const fetchInitialSparksFeed = createAsyncThunk(
   "sparks/fetchInitial",
   async (_, { getState }) => {
      const state = getState() as RootState

      const sparkOptions = getSparkOptions(state)

      return sparkService.fetchFeed(sparkOptions)
   }
)

const sparksFeedSlice = createSlice({
   name: "Sparks Feed",
   initialState,
   reducers: {
      togglePlaying: (state) => {
         state.playing = !state.playing
      },
      setVideoPlaying: (state, action: PayloadAction<boolean>) => {
         state.playing = action.payload
      },
      setVideosMuted: (state, action: PayloadAction<boolean>) => {
         state.videosMuted = action.payload
      },
      setOriginalSparkId: (state, action: PayloadAction<string | null>) => {
         state.originalSparkId = action.payload
      },
      setSparks: (state, action: PayloadAction<SparkPresenter[]>) => {
         state.sparks = action.payload
         state.currentPlayingIndex = 0
      },
      setGroupId: (state, action: PayloadAction<SparksState["groupId"]>) => {
         state.groupId = action.payload
      },
      setUserEmail: (state, action: PayloadAction<string>) => {
         state.userEmail = action.payload
      },
      setSparkCategories: (
         state,
         action: PayloadAction<SparkCategory["id"][]>
      ) => {
         state.sparkCategoryIds = action.payload

         if (action.payload.length) {
            state.fetchNextSparksStatus = "loading"
         }
      },
      swipeToSparkByIndex: (state, action: PayloadAction<number>) => {
         const newIndex = action.payload
         if (newIndex >= 0 && newIndex < state.sparks.length) {
            state.currentPlayingIndex = newIndex
         }
      },
      setEventNotification: (
         state,
         action: PayloadAction<UserSparksNotification>
      ) => {
         state.eventNotification = action.payload
      },
      removeEventNotifications: (state) => {
         state.eventNotification = null
      },
      setCardEventNotification: (
         state,
         action: PayloadAction<UserSparksNotification>
      ) => {
         state.cardNotification = action.payload

         const endContentGroupNotificationIndex = state.sparks.findIndex(
            (spark) =>
               spark?.cardNotificationType === SparkCardNotificationTypes.GROUP
         )

         state.sparks = [
            ...state.sparks.slice(0, endContentGroupNotificationIndex),
            {
               ...state.sparks[endContentGroupNotificationIndex],
               cardNotificationType: SparkCardNotificationTypes.EVENT,
            },
            ...state.sparks.slice(endContentGroupNotificationIndex + 1),
         ]
      },
      showEventDetailsDialog: (state, action: PayloadAction<boolean>) => {
         // when closing event dialog we want to remove the notification
         if (action.payload === false) {
            state.eventNotification = null
         }
         state.showEventDetailsDialog = action.payload
      },
      addCardNotificationToSparksList: (
         state,
         action: PayloadAction<AddCardNotificationPayload>
      ) => {
         const lastPosition = state.sparks.length

         const { position = lastPosition, type } = action.payload

         const filteredSparks = state.sparks.filter(
            (spark) => spark?.cardNotificationType !== type
         )

         state.sparks = [
            ...filteredSparks.slice(0, position),
            {
               ...filteredSparks[0],
               isCardNotification: true,
               cardNotificationType: type,
            },
            ...filteredSparks.slice(position),
         ]
      },
      removeGroupId: (state) => {
         state.groupId = null
         state.hasMoreSparks = true
      },
      setCameFromCompanyPageLink: (state, action: PayloadAction<string>) => {
         state.cameFromCompanyPageLink = action.payload
      },
      setEventToRegisterTo: (state, action: PayloadAction<string>) => {
         state.eventToRegisterTo = action.payload
      },
      setJobToOpen: (state, action: PayloadAction<string>) => {
         state.jobToOpen = action.payload
      },
      setAutoAction: (state, action: PayloadAction<AutomaticActions>) => {
         state.autoAction = action.payload
      },
      setConversionCardInterval: (state, action: PayloadAction<number>) => {
         state.conversionCardInterval = action.payload
      },
      incrementConversionCounter: (state) => {
         state.conversionCounter++
      },
      resetConversionCounter: (state) => {
         state.conversionCounter = 0
      },
      resetSparksFeed: (state) => {
         state.sparks = []
         state.currentPlayingIndex = 0
         state.hasMoreSparks = true
         state.initialFetchStatus = "idle"
         state.initialSparksFetched = false
         state.fetchNextSparksStatus = "idle"
         state.fetchNextError = null
         state.initialFetchError = null
         state.eventNotification = null
         state.sparkCategoryIds = []
         state.showEventDetailsDialog = false
         state.originalSparkId = null
         state.cameFromCompanyPageLink = null
         state.cardNotification = null
         state.videosMuted = false
         state.playing = true
         state.conversionCounter = 0
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchNextSparks.pending, (state) => {
            state.fetchNextSparksStatus = "loading"
         })
         .addCase(
            fetchNextSparks.fulfilled,
            (state, action: PayloadAction<SparkPresenter[]>) => {
               const { sparks } = state

               state.fetchNextSparksStatus = "idle"

               // We don't mind duplicates since the feed is endless
               state.sparks = [...sparks, ...action.payload]

               if (action.payload.length === 0) {
                  state.hasMoreSparks = false
               }
            }
         )
         .addCase(fetchNextSparks.rejected, (state, action) => {
            state.fetchNextSparksStatus = "failed"
            state.fetchNextError = action.error.message
         })
         .addCase(fetchInitialSparksFeed.pending, (state) => {
            state.initialFetchStatus = "loading"
         })
         .addCase(
            fetchInitialSparksFeed.fulfilled,
            (state, action: PayloadAction<SparkPresenter[]>) => {
               const { sparks, numberOfSparksToFetch } = state

               state.initialFetchStatus = "idle"
               state.initialSparksFetched = true

               state.sparks = mergeSparks(sparks, action.payload)

               if (action.payload.length < numberOfSparksToFetch) {
                  state.hasMoreSparks = false
               }
            }
         )
         .addCase(fetchInitialSparksFeed.rejected, (state, action) => {
            state.initialFetchStatus = "failed"
            state.initialFetchError = action.error.message
         })
   },
})

/**
 * Merge the existing sparks with the new sparks and remove duplicates
 */
const mergeSparks = (
   existingSparks: SparkPresenter[],
   newSparks: SparkPresenter[]
) => {
   return [
      ...existingSparks,
      ...newSparks.filter(
         (spark) => !existingSparks.find((s) => s.id === spark.id)
      ),
   ]
}

/**
 * Get the spark options from the state
 * @param state - The redux state
 * @returns spark options
 */
const getSparkOptions = (state: RootState) => {
   const { numberOfSparksToFetch, groupId, userEmail, sparkCategoryIds } =
      state.sparksFeed
   return {
      numberOfSparks: numberOfSparksToFetch,
      sparkCategoryIds: sparkCategoryIds,
      ...(groupId ? { groupId } : { userId: userEmail || null }),
   }
}

export const {
   setOriginalSparkId,
   setSparks,
   setGroupId,
   setUserEmail,
   setSparkCategories,
   resetSparksFeed,
   swipeToSparkByIndex,
   setEventNotification,
   removeEventNotifications,
   showEventDetailsDialog,
   addCardNotificationToSparksList,
   removeGroupId,
   setCardEventNotification,
   setCameFromCompanyPageLink,
   setEventToRegisterTo,
   setJobToOpen,
   setAutoAction,
   setVideosMuted,
   setVideoPlaying,
   togglePlaying,
   setConversionCardInterval,
   resetConversionCounter,
   incrementConversionCounter,
} = sparksFeedSlice.actions

export default sparksFeedSlice.reducer
