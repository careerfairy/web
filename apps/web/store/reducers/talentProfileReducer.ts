import { StudyBackground } from "@careerfairy/shared-lib/users"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface ITalentProfileState {
   createStudyBackgroundDialogOpen: boolean
   editingStudyBackground: StudyBackground
   isEditingStudyBackground: boolean
}

const initialState: ITalentProfileState = {
   createStudyBackgroundDialogOpen: false,
   editingStudyBackground: null,
   isEditingStudyBackground: false,
}

export const talentProfileSlice = createSlice({
   name: "Talent Profile",
   initialState,
   reducers: {
      openCreateStudyBackgroundDialog: (state) => {
         state.editingStudyBackground = null
         state.isEditingStudyBackground = false
         state.createStudyBackgroundDialogOpen = true
      },
      closeCreateStudyBackgroundDialog: (state) => {
         state.createStudyBackgroundDialogOpen = false
         state.editingStudyBackground = null
         state.isEditingStudyBackground = false
      },
      setEditingStudyBackground: (
         state,
         action: PayloadAction<StudyBackground> = null
      ) => {
         state.isEditingStudyBackground = true
         state.editingStudyBackground = action.payload
         state.createStudyBackgroundDialogOpen = true
      },
   },
})

export const {
   openCreateStudyBackgroundDialog,
   closeCreateStudyBackgroundDialog,
   setEditingStudyBackground,
} = talentProfileSlice.actions

export default talentProfileSlice.reducer
