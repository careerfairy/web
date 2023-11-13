import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { streamingAppReducer } from "./streamingAppSlice"

export const store = configureStore({
   reducer: {
      streamingApp: streamingAppReducer,
   },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
   ReturnType,
   RootState,
   unknown,
   Action<string>
>
