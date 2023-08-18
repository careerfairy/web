import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { sparkService } from "data/firebase/SparksService"
import { type RootState } from "store"

type Status = "idle" | "loading" | "failed"

// Initial state
interface SparksState {
   sparks: SparkPresenter[]
   currentPlayingIndex: number
   hasMoreSparks: boolean
   groupId: string | null
   userEmail: string | null
   numberOfSparksToFetch: number
   fetchNextSparksStatus: Status
   initialFetchStatus: Status
   initialSparksFetched: boolean
   error: string | null
}

const initialState: SparksState = {
   sparks: [],
   currentPlayingIndex: 0,
   hasMoreSparks: true,
   groupId: null,
   userEmail: null,
   numberOfSparksToFetch: 3,
   initialFetchStatus: "loading",
   fetchNextSparksStatus: "idle",
   initialSparksFetched: false,
   error: null,
}

// Async thunk to fetch the next sparks
export const fetchNextSparks = createAsyncThunk(
   "sparks/fetchNext",
   async (_, { getState }) => {
      const {
         sparksFeed: {
            sparks,
            hasMoreSparks,
            groupId,
            userEmail,
            numberOfSparksToFetch,
         },
      } = getState() as RootState

      const lastSpark = sparks[sparks.length - 1]

      if (!hasMoreSparks) {
         return []
      }

      const sparkOptions = {
         numberOfSparks: numberOfSparksToFetch,
         ...(groupId ? { groupId } : { userId: userEmail || null }),
      }

      return sparkService.fetchNextSparks(lastSpark, sparkOptions)
   }
)
// Async thunk to fetch the next spark IDs
export const fetchInitialSparksFeed = createAsyncThunk(
   "sparks/fetchInitial",
   async (_, { getState }) => {
      const state = getState() as RootState

      const groupId = state.sparksFeed.groupId
      const userEmail = state.sparksFeed.userEmail
      const numberOfSparks = state.sparksFeed.numberOfSparksToFetch

      if (groupId) {
         return sparkService.fetchFeed({
            groupId,
            numberOfSparks,
         })
      }

      return sparkService.fetchFeed({
         userId: userEmail || "public", // If the user is not logged in, then use the public feed
         numberOfSparks,
      })
   }
)

const sparksFeedSlice = createSlice({
   name: "Sparks Feed",
   initialState,
   reducers: {
      setSparks: (state, action: PayloadAction<SparkPresenter[]>) => {
         state.sparks = action.payload
      },
      setGroupId: (state, action: PayloadAction<SparksState["groupId"]>) => {
         state.groupId = action.payload
      },
      setUserEmail: (state, action: PayloadAction<string>) => {
         state.userEmail = action.payload
      },
      swipeNextSpark: (state) => {
         // Check if it's not the last spark
         if (state.currentPlayingIndex < state.sparks.length - 1) {
            state.currentPlayingIndex += 1
         }
      },
      swipePreviousSpark: (state) => {
         // Check if it's not the first spark
         if (state.currentPlayingIndex > 0) {
            state.currentPlayingIndex -= 1
         }
      },
      resetSparksFeed: (state) => {
         state.sparks = []
         state.currentPlayingIndex = 0
         state.hasMoreSparks = true
         state.initialFetchStatus = "loading"
         state.initialSparksFetched = false
         state.error = null
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
               state.fetchNextSparksStatus = "idle"
               // Add the sparks to the list
               state.sparks = [...state.sparks, ...action.payload]

               // If there are no spark, then there are no more sparks
               if (action.payload.length < state.numberOfSparksToFetch) {
                  state.hasMoreSparks = false
               }
            }
         )
         .addCase(fetchNextSparks.rejected, (state, action) => {
            state.fetchNextSparksStatus = "failed"
            state.error = action.error.message
         })
         .addCase(fetchInitialSparksFeed.pending, (state) => {
            state.initialFetchStatus = "loading"
         })
         .addCase(
            fetchInitialSparksFeed.fulfilled,
            (state, action: PayloadAction<SparkPresenter[]>) => {
               state.initialFetchStatus = "idle"
               state.initialSparksFetched = true

               // If there are no spark, then there are no more sparks
               if (action.payload.length < state.numberOfSparksToFetch) {
                  state.hasMoreSparks = false
               }

               state.sparks = [
                  ...state.sparks,
                  ...action.payload.filter(
                     (spark) => !state.sparks.find((s) => s.id === spark.id)
                  ),
               ]
            }
         )
         .addCase(fetchInitialSparksFeed.rejected, (state, action) => {
            state.initialFetchStatus = "failed"
            state.error = action.error.message
         })
   },
})

export const {
   setSparks,
   setGroupId,
   swipeNextSpark,
   swipePreviousSpark,
   setUserEmail,
   resetSparksFeed,
} = sparksFeedSlice.actions

export default sparksFeedSlice.reducer
