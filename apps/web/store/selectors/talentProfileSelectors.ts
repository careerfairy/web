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
