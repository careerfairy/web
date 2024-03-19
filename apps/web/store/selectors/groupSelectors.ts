import { RootState } from "../"

export const groupSelector = (state: RootState) => state.firestore.data.group

export const groupATSAccountsSelector = (state: RootState) =>
   state.firestore.data.ats

export const notificationsSelector = (state: RootState) =>
   state.firestore.ordered.notifications || []

export const groupPlansDialogInitialStepSelector = (state: RootState) =>
   state.groupPlan.groupPlansForm.initialStep

export const plansDialogOpenSelector = (state: RootState) =>
   state.groupPlan.plansDialogOpen

export const selectedPlanSelector = (state: RootState) =>
   state.groupPlan.groupPlansForm.selectedPlan

export const clientSecret = (state: RootState) =>
   state.groupPlan.groupPlansForm.clientSecret
