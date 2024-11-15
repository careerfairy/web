import { ProfileLink, StudyBackground } from "@careerfairy/shared-lib/users"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface ITalentProfileState {
   // Study background
   createStudyBackgroundDialogOpen: boolean
   editingStudyBackground: StudyBackground
   isEditingStudyBackground: boolean

   // Links
   createLinkDialogOpen: boolean
   editingLink: ProfileLink
   isEditingLink: boolean
}

const initialState: ITalentProfileState = {
   // Study background
   createStudyBackgroundDialogOpen: false,
   editingStudyBackground: null,
   isEditingStudyBackground: false,

   // Links
   createLinkDialogOpen: false,
   editingLink: null,
   isEditingLink: false,
}

export const TalentProfileItemTypes = {
   StudyBackground: "studyBackground",
   Link: "link",
   Interest: "interest",
   Language: "language",
} as const

export type TalentProfileItemType =
   (typeof TalentProfileItemTypes)[keyof typeof TalentProfileItemTypes]

type OpenCreateDialogPayload = {
   type: TalentProfileItemType
}

type CloseCreateDialogPayload = {
   type: TalentProfileItemType
}

type EditingPayload<T> = {
   type: TalentProfileItemType
   data: T
}

export const talentProfileSlice = createSlice({
   name: "Talent Profile",
   initialState,
   reducers: {
      openCreateDialog: (
         state,
         action: PayloadAction<OpenCreateDialogPayload>
      ) => {
         switch (action.payload.type) {
            case TalentProfileItemTypes.StudyBackground: {
               state.editingStudyBackground = null
               state.isEditingStudyBackground = false
               state.createStudyBackgroundDialogOpen = true
            }
         }
      },
      closeCreateDialog: (
         state,
         action: PayloadAction<CloseCreateDialogPayload>
      ) => {
         switch (action.payload.type) {
            case TalentProfileItemTypes.StudyBackground: {
               state.createStudyBackgroundDialogOpen = false
               state.editingStudyBackground = null
               state.isEditingStudyBackground = false
            }
         }
      },
      setEditing: (
         state,
         action: PayloadAction<EditingPayload<StudyBackground | ProfileLink>> // TODO-WG: Add interests and language types when existing
      ) => {
         switch (action.payload.type) {
            case TalentProfileItemTypes.StudyBackground: {
               state.isEditingStudyBackground = true
               state.editingStudyBackground = action.payload
                  .data as StudyBackground
               state.createStudyBackgroundDialogOpen = true
            }
         }
      },
   },
})

export const { openCreateDialog, closeCreateDialog, setEditing } =
   talentProfileSlice.actions

export default talentProfileSlice.reducer
