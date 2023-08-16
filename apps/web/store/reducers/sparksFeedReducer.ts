import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
   FetchNextSparkOptions,
   sparkService,
} from "data/firebase/SparksService"
import { type RootState } from "store"

// Initial state
interface SparksState {
   sparks: SparkPresenter[]
   currentPlayingIndex: number
   hasMoreSparks: boolean
   currentOptions: FetchNextSparkOptions | null
   status: "idle" | "loading" | "failed"
   error: string | null
}

const initialState: SparksState = {
   sparks: [],
   currentPlayingIndex: 0,
   hasMoreSparks: true,
   currentOptions: null,
   status: "idle",
   error: null,
}

// Async thunk to fetch the next sparks
export const fetchNextSparks = createAsyncThunk(
   "sparks/fetchNext",
   async (lastSpark: SparkPresenter | null, { getState }) => {
      const state = getState() as RootState
      const currentOptions = state.sparksFeed.currentOptions
      return sparkService.fetchNextSparks(lastSpark, currentOptions)
   }
)

const sparksFeedSlice = createSlice({
   name: "Sparks Feed",
   initialState,
   reducers: {
      setInitialSparks: (state, action: PayloadAction<SparkPresenter[]>) => {
         state.sparks = action.payload
      },
      setCurrentOptions: (
         state,
         action: PayloadAction<FetchNextSparkOptions | null>
      ) => {
         state.currentOptions = action.payload
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
               // If there are no sparks, then there are no more sparks
               if (action.payload.length === 0) {
                  state.hasMoreSparks = false
               } else {
                  // Otherwise, add the sparks to the list
                  state.sparks = [...state.sparks, ...action.payload]
               }
            }
         )
         .addCase(fetchNextSparks.rejected, (state, action) => {
            state.status = "failed"
            state.error = action.error.message
         })
   },
})

export const {
   setInitialSparks,
   setCurrentOptions,
   swipeNextSpark,
   swipePreviousSpark,
} = sparksFeedSlice.actions

export default sparksFeedSlice.reducer
