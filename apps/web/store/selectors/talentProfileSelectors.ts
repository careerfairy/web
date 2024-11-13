import { RootState } from "../"

export const talentProfileCreateStudyBackgroundOpenSelector = (
   state: RootState
) => state.talentProfile.createStudyBackgroundDialogOpen

export const talentProfileEditingStudyBackgroundOpenSelector = (
   state: RootState
) => state.talentProfile.editingStudyBackground

export const talentProfileIsEditingStudyBackgroundSelector = (
   state: RootState
) => state.talentProfile.isEditingStudyBackground
