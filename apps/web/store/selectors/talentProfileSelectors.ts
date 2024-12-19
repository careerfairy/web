import { RootState } from "../"

// Study background
export const talentProfileCreateStudyBackgroundOpenSelector = (
   state: RootState
) => state.talentProfile.createStudyBackgroundDialogOpen

export const talentProfileEditingStudyBackgroundOpenSelector = (
   state: RootState
) => state.talentProfile.editingStudyBackground

export const talentProfileIsEditingStudyBackgroundSelector = (
   state: RootState
) => state.talentProfile.isEditingStudyBackground

// Link
export const talentProfileCreateLinkOpenSelector = (state: RootState) =>
   state.talentProfile.createLinkDialogOpen

export const talentProfileEditingLinkOpenSelector = (state: RootState) =>
   state.talentProfile.editingLink

export const talentProfileIsEditingLinkSelector = (state: RootState) =>
   state.talentProfile.isEditingLink

// Language
export const talentProfileCreateLanguageOpenSelector = (state: RootState) =>
   state.talentProfile.createLanguageDialogOpen

export const talentProfileEditingLanguageOpenSelector = (state: RootState) =>
   state.talentProfile.editingLanguage

export const talentProfileIsEditingLanguageSelector = (state: RootState) =>
   state.talentProfile.isEditingLanguage

// Interest
export const talentProfileCreateInterestOpenSelector = (state: RootState) =>
   state.talentProfile.createInterestDialogOpen

export const talentProfileEditingInterestOpenSelector = (state: RootState) =>
   state.talentProfile.editingInterest

export const talentProfileIsEditingInterestSelector = (state: RootState) =>
   state.talentProfile.isEditingInterest
