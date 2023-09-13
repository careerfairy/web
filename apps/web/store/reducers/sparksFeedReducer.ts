import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparkCategory } from "@careerfairy/shared-lib/sparks/sparks"
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { sparkService } from "data/firebase/SparksService"
import { v4 as uuidv4 } from "uuid"
import { type RootState } from "store"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"

type Status = "idle" | "loading" | "failed"

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
   currentEventNotification: UserSparksNotification | null
   sparkCategoryIds: SparkCategory["id"][]
   showEventDetailsDialog: boolean
   /**
    * A sessionId is a unique identifier generated each time a user views a specific spark.
    * When the user scrolls to a new spark, a new sessionId is generated.
    */
   sessionId: string | null
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
   currentEventNotification: null,
   showEventDetailsDialog: false,
   sessionId: null,
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
      setOriginalSparkId: (state, action: PayloadAction<string | null>) => {
         state.originalSparkId = action.payload
      },
      setSparks: (state, action: PayloadAction<SparkPresenter[]>) => {
         state.sparks = action.payload
         state.currentPlayingIndex = 0

         // also generate a sessionId for the first spark
         if (action.payload.length > 0) {
            const sparkId = action.payload[state.currentPlayingIndex].id
            state.sessionId = generatSessionId(sparkId)
         }
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
      },
      swipeNextSparkByIndex: (state, action: PayloadAction<number>) => {
         const newIndex = action.payload
         if (newIndex >= 0 && newIndex < state.sparks.length) {
            state.currentPlayingIndex = newIndex

            const sparkId = state.sparks[newIndex].id

            state.sessionId = generatSessionId(sparkId)
         }
      },
      setCurrentEventNotification: (
         state,
         action: PayloadAction<UserSparksNotification>
      ) => {
         state.currentEventNotification = action.payload
      },
      removeCurrentEventNotifications: (state) => {
         state.currentEventNotification = null
      },
      showEventDetailsDialog: (state, action: PayloadAction<boolean>) => {
         // when closing event dialog we want to remove the notification
         if (action.payload === false) {
            state.currentEventNotification = null
         }
         state.showEventDetailsDialog = action.payload
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
         state.currentEventNotification = null
         state.sparkCategoryIds = []
         state.showEventDetailsDialog = false
         state.sessionId = null
         state.originalSparkId = null
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
               const { sparks, numberOfSparksToFetch } = state

               state.fetchNextSparksStatus = "idle"

               // We don't mind duplicates since the feed is endless
               state.sparks = [...sparks, ...action.payload]

               if (action.payload.length < numberOfSparksToFetch) {
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

const generatSessionId = (sparkId: string) => {
   const timestamp = new Date().toISOString()
   return `spark-${sparkId}-${timestamp}-${uuidv4()}`
}

export const {
   setOriginalSparkId,
   setSparks,
   setGroupId,
   setUserEmail,
   setSparkCategories,
   resetSparksFeed,
   swipeNextSparkByIndex,
   setCurrentEventNotification,
   removeCurrentEventNotifications,
   showEventDetailsDialog,
} = sparksFeedSlice.actions

export default sparksFeedSlice.reducer
