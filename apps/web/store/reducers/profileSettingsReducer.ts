import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface IProfileSettingsState {
   personalInfo: {
      isDirty: boolean
   }
}

const initialState: IProfileSettingsState = {
   personalInfo: {
      isDirty: false,
   },
}

export type ProfileSettings = keyof IProfileSettingsState

export const profileSettingsSlice = createSlice({
   name: "Profile settings",
   initialState,
   reducers: {
      setDirty: (
         state,
         action: PayloadAction<{ setting: ProfileSettings; dirty: boolean }>
      ) => {
         state[action.payload.setting].isDirty = action.payload.dirty
      },
   },
})

// Export actions
export const { setDirty } = profileSettingsSlice.actions

// Export reducer
export default profileSettingsSlice.reducer
