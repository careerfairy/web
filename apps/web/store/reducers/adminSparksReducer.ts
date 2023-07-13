// sparksSlice.ts
import { createSlice } from "@reduxjs/toolkit"

interface ISparksState {
   sparkDialogOpen: boolean
}

const initialState: ISparksState = {
   sparkDialogOpen: false,
}

export const adminSparksSlice = createSlice({
   name: "Admin Sparks",
   initialState,
   reducers: {
      openSparkDialog: (state) => {
         state.sparkDialogOpen = true
      },
      closeSparkDialog: (state) => {
         state.sparkDialogOpen = false
      },
   },
})

// Export actions
export const { openSparkDialog, closeSparkDialog } = adminSparksSlice.actions

// Export reducer
export default adminSparksSlice.reducer
