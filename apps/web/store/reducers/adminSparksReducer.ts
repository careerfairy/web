// sparksSlice.ts
import { createSlice } from "@reduxjs/toolkit"

interface SparksState {
   dialogOpen: boolean
}

const initialState: SparksState = {
   dialogOpen: false,
}

export const adminSparksSlice = createSlice({
   name: "Admin Sparks",
   initialState,
   reducers: {
      openDialog: (state) => {
         state.dialogOpen = true
      },
      closeDialog: (state) => {
         state.dialogOpen = false
      },
   },
})

// Export actions
export const { openDialog, closeDialog } = adminSparksSlice.actions

// Export reducer
export default adminSparksSlice.reducer
