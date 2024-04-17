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
   APPLY = "apply",
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
   interactionSource: string
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
   autoAction: null,
   conversionCardInterval: 0,
   interactionSource: null,
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
         const endContentGroupNotificationIndex = state.sparks.findIndex(
            (spark) =>
               spark?.cardNotificationType === SparkCardNotificationTypes.GROUP
         )

         if (endContentGroupNotificationIndex > 0) {
            state.cardNotification = action.payload

            state.sparks = [
               ...state.sparks.slice(0, endContentGroupNotificationIndex),
               {
                  ...state.sparks[endContentGroupNotificationIndex],
                  cardNotificationType: SparkCardNotificationTypes.EVENT,
               },
               ...state.sparks.slice(endContentGroupNotificationIndex + 1),
            ]
         }
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
      setInteractionSource: (state, action: PayloadAction<string>) => {
         state.interactionSource = action.payload
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
      removeNotificationsByType: (
         state,
         action: PayloadAction<SparkCardNotificationTypes>
      ) => {
         const notificationType = action.payload

         const filteredSparks = state.sparks.filter(
            (spark) => spark.cardNotificationType !== notificationType
         )

         if (filteredSparks.length !== state.sparks.length) {
            state.sparks = filteredSparks
         }
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
         state.conversionCardInterval = 0
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
               state.sparks = insertNotificationIfNeeded(state, [
                  ...sparks,
                  ...action.payload,
               ])

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

               const newSparks = insertNotificationIfNeeded(
                  state,
                  mergeSparks(sparks, action.payload)
               )

               state.sparks = newSparks

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

/**
 * Inserts card notifications into the array of sparks if needed, based on the conversion card interval.
 *
 * @param state - The current state.
 * @param sparks - The array of sparks to be processed.
 * @returns The array of sparks with card notifications inserted.
 */
const insertNotificationIfNeeded = (
   state: SparksState,
   sparks: SparkPresenter[]
): SparkPresenter[] => {
   const conversionCardInterval = state.conversionCardInterval

   // Copy the array of sparks to avoid mutating the original array
   const results = sparks.slice()

   // If the conversion card interval is 0, no need to insert notifications
   if (conversionCardInterval === 0) {
      return results
   }

   const lastCardNotificationIndex = results.findLastIndex(
      (spark) => spark.isCardNotification
   )

   // Set the initial index to insert notifications after the last one if it exists, otherwise, start from the beginning
   const initialIndex =
      lastCardNotificationIndex > 0 ? lastCardNotificationIndex + 1 : 0

   let alreadyHaveNotifications = false

   // Iterate through the sparks array to insert card notifications based on the conversion card interval
   for (
      let index = initialIndex;
      index < results.length;
      index += conversionCardInterval + (alreadyHaveNotifications ? 1 : 0)
   ) {
      if (index !== initialIndex) {
         alreadyHaveNotifications = true

         const sparkNotificationToAdd = {
            ...results[index],
            isCardNotification: true,
            cardNotificationType: SparkCardNotificationTypes.CONVERSION,
         } as SparkPresenter

         // Insert the spark notification at the calculated index based on the conversion card interval
         results.splice(index, 0, sparkNotificationToAdd)
      }
   }

   return results
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
   setInteractionSource,
   setEventToRegisterTo,
   setJobToOpen,
   setAutoAction,
   setVideosMuted,
   setVideoPlaying,
   togglePlaying,
   setConversionCardInterval,
   removeNotificationsByType,
} = sparksFeedSlice.actions

export default sparksFeedSlice.reducer
