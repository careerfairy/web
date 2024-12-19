import {
   ProfileInterest,
   ProfileLanguage,
   ProfileLink,
   StudyBackground,
} from "@careerfairy/shared-lib/users"
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

   // Languages
   createLanguageDialogOpen: boolean
   editingLanguage: ProfileLanguage
   isEditingLanguage: boolean

   // Interests
   createInterestDialogOpen: boolean
   editingInterest: ProfileInterest
   isEditingInterest: boolean
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

   // Languages
   createLanguageDialogOpen: false,
   editingLanguage: null,
   isEditingLanguage: false,

   // Interests
   createInterestDialogOpen: false,
   editingInterest: null,
   isEditingInterest: false,
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
               break
            }
            case TalentProfileItemTypes.Link: {
               state.editingLink = null
               state.isEditingLink = false
               state.createLinkDialogOpen = true
               break
            }
            case TalentProfileItemTypes.Language: {
               state.editingLanguage = null
               state.isEditingLanguage = false
               state.createLanguageDialogOpen = true
               break
            }
            case TalentProfileItemTypes.Interest: {
               state.editingInterest = null
               state.isEditingInterest = false
               state.createInterestDialogOpen = true
               break
            }
            default: {
               return
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
               break
            }
            case TalentProfileItemTypes.Link: {
               state.createLinkDialogOpen = false
               state.editingLink = null
               state.isEditingLink = false
               break
            }
            case TalentProfileItemTypes.Language: {
               state.createLanguageDialogOpen = false
               state.editingLanguage = null
               state.isEditingLanguage = false
               break
            }
            case TalentProfileItemTypes.Interest: {
               state.createInterestDialogOpen = false
               state.editingInterest = null
               state.isEditingInterest = false
               break
            }
            default: {
               return
            }
         }
      },
      setEditing: (
         state,
         action: PayloadAction<
            EditingPayload<
               StudyBackground | ProfileLink | ProfileLanguage | ProfileInterest
            >
         >
      ) => {
         switch (action.payload.type) {
            case TalentProfileItemTypes.StudyBackground: {
               state.isEditingStudyBackground = true
               state.editingStudyBackground = action.payload
                  .data as StudyBackground
               state.createStudyBackgroundDialogOpen = true
               break
            }
            case TalentProfileItemTypes.Link: {
               state.isEditingLink = true
               state.editingLink = action.payload.data as ProfileLink
               state.createLinkDialogOpen = true
               break
            }
            case TalentProfileItemTypes.Language: {
               state.isEditingLanguage = true
               state.editingLanguage = action.payload.data as ProfileLanguage
               state.createLanguageDialogOpen = true
               break
            }
            case TalentProfileItemTypes.Interest: {
               state.isEditingInterest = true
               state.editingInterest = action.payload.data as ProfileInterest
               state.createInterestDialogOpen = true
               break
            }
            default: {
               return
            }
         }
      },
   },
})

export const { openCreateDialog, closeCreateDialog, setEditing } =
   talentProfileSlice.actions

export default talentProfileSlice.reducer
