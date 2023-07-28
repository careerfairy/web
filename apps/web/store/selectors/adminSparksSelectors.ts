import { RootState } from "../"

export const sparksDialogOpenSelector = (state: RootState) =>
   state.adminSparks.sparkDialogOpen

export const sparksSelectedCreatorId = (state: RootState) =>
   state.adminSparks.sparksForm.selectedPublicCreator?.id ?? null

export const sparksSelectedSparkId = (state: RootState) =>
   state.adminSparks.sparksForm.selectedSparkId

export const sparksCachedSparkFormValues = (state: RootState) =>
   state.adminSparks.sparksForm.cachedSparkFormValues

export const sparksConfirmCloseSparksDialogOpen = (state: RootState) =>
   state.adminSparks.confirmCloseSparksDialogOpen

export const sparksShowHiddenSparks = (state: RootState) =>
   state.adminSparks.showHiddenSparks

export const sparksFormSelectedCreator = (state: RootState) =>
   state.adminSparks.sparksForm.selectedPublicCreator
