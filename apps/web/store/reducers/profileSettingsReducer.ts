import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { TalentProfileTabValues } from "layouts/UserLayout/TalentProfile/TalentProfileView"

export type ProfileTab = Exclude<TalentProfileTabValues, "/profile/settings">

interface IProfileSettingsState {
   personalInfo: {
      isDirty: boolean
   }
   profileTab: ProfileTab
}

const initialState: IProfileSettingsState = {
   personalInfo: {
      isDirty: false,
   },
   profileTab: "/profile",
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
         switch (action.payload.setting) {
            case "personalInfo":
               state.personalInfo.isDirty = action.payload.dirty
               break
         }
      },
      setProfileTab: (state, action: PayloadAction<ProfileTab>) => {
         state.profileTab = action.payload
      },
   },
})

// Export actions
export const { setDirty, setProfileTab } = profileSettingsSlice.actions

// Export reducer
export default profileSettingsSlice.reducer
