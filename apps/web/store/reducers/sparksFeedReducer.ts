import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { sparkService } from "data/firebase/SparksService"
import { type RootState } from "store"

// Initial state
interface SparksState {
   sparks: SparkPresenter[]
   currentPlayingIndex: number
   hasMoreSparks: boolean
   groupId: string | null
   numberOfSparksToFetch: number
   status: "idle" | "loading" | "failed"
   error: string | null
}

const initialState: SparksState = {
   sparks: [],
   currentPlayingIndex: 0,
   hasMoreSparks: true,
   groupId: null,
   numberOfSparksToFetch: 3,
   status: "idle",
   error: null,
}

// Async thunk to fetch the next spark IDs
export const fetchNextSparks = createAsyncThunk(
   "sparks/fetchNext",
   async (_, { getState }) => {
      const state = getState() as RootState
      const lastSpark =
         state.sparksFeed.sparks[state.sparksFeed.sparks.length - 1]
      const hasMoreSparks = state.sparksFeed.hasMoreSparks

      if (!hasMoreSparks) {
         return []
      }

      return sparkService.fetchNextSparks(lastSpark, {
         groupId: state.sparksFeed.groupId,
         numberOfSparks: state.sparksFeed.numberOfSparksToFetch,
      })
   }
)
// Async thunk to fetch the next spark IDs
export const fetchInitialSparksFeed = createAsyncThunk(
   "sparks/fetchInitial",
   async (userId: string, { getState }) => {
      const state = getState() as RootState

      const groupId = state.sparksFeed.groupId

      if (groupId) {
         return sparkService.fetchFeed({
            groupId,
         })
      }

      return sparkService.fetchFeed({
         userId,
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
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchNextSparks.pending, (state) => {
            state.status = "loading"
         })
         .addCase(
            fetchNextSparks.fulfilled,
            (state, action: PayloadAction<SparkPresenter[]>) => {
               state.status = "idle"
               // Add the sparks to the list
               state.sparks = [...state.sparks, ...action.payload]

               // If there are no spark, then there are no more sparks
               if (action.payload.length < state.numberOfSparksToFetch) {
                  state.hasMoreSparks = false
               }
            }
         )
         .addCase(fetchNextSparks.rejected, (state, action) => {
            state.status = "failed"
            state.error = action.error.message
         })
   },
})

export const { setSparks, setGroupId, swipeNextSpark, swipePreviousSpark } =
   sparksFeedSlice.actions

export default sparksFeedSlice.reducer
