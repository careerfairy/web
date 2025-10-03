import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type OfflineEventsTableState = {
   hoveredRow: string | null
}

const initialState: OfflineEventsTableState = {
   hoveredRow: null,
}

const offlineEventsTableSlice = createSlice({
   name: "offlineEventsTable",
   initialState,
   reducers: {
      setHoveredRow: (state, action: PayloadAction<string | null>) => {
         state.hoveredRow = action.payload
      },
      clearHoveredRow: (state) => {
         state.hoveredRow = null
      },
   },
})

export const { setHoveredRow, clearHoveredRow } =
   offlineEventsTableSlice.actions
export default offlineEventsTableSlice.reducer
