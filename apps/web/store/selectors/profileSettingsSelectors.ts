import { TalentProfileTabValues } from "layouts/UserLayout/TalentProfile/TalentProfileView"
import { RootState } from "../"

export const isSettingFormDirty = (state: RootState): boolean =>
   state.profileSettings.personalInfo.isDirty

export const getProfileTab = (state: RootState): TalentProfileTabValues =>
   state.profileSettings.profileTab
