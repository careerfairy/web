import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type EventsTableState = {
   hoveredRow: string | null
}

const initialState: EventsTableState = {
   hoveredRow: null,
}

const eventsTableSlice = createSlice({
   name: "eventsTable",
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

export const { setHoveredRow, clearHoveredRow } = eventsTableSlice.actions
export default eventsTableSlice.reducer
