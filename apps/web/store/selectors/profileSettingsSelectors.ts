import { RootState } from "../"

export const isSettingFormDirty = (state: RootState): boolean =>
   state.profileSettings.personalInfo.isDirty
