import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import SteppedDialog, {
   View,
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import React, { createContext, useCallback, useMemo } from "react"
import SelectPlanView from "./SelectPlanView"
import ConfirmSparksPlanView from "./ConfirmSparksPlanView"
import ConfirmSparksTrialView from "./ConfirmSparksTrialView"
import SuccessView from "./SuccessView"
import { useStartPlanMutation } from "./useStartPlanMutation"

type Props = {
   open: boolean
   handleClose: () => void
   groupToManage: GroupPresenter
}

export const PlanConfirmationDialogKeys = {
   SelectPlan: "select-plan",
   ConfirmSparksPlan: "confirm-sparks-plan",
   ConfirmSparksTrial: "confirm-sparks-trial",
   Success: "success",
} as const

const views = [
   {
      key: PlanConfirmationDialogKeys.SelectPlan,
      Component: SelectPlanView,
   },
   {
      key: PlanConfirmationDialogKeys.ConfirmSparksPlan,
      Component: ConfirmSparksPlanView,
   },
   {
      key: PlanConfirmationDialogKeys.ConfirmSparksTrial,
      Component: ConfirmSparksTrialView,
   },
   {
      key: PlanConfirmationDialogKeys.Success,
      Component: SuccessView,
   },
] as const satisfies ReadonlyArray<View>

export type PlanConfirmationDialogKey =
   (typeof PlanConfirmationDialogKeys)[keyof typeof PlanConfirmationDialogKeys]

type PlanConfirmationDialogContextType = {
   groupToManage: GroupPresenter
   handleClose: () => void
   startPlan: (planType: GroupPlanType) => Promise<void>
   isMutating: boolean
   updatedGroupPlanType: GroupPlanType | undefined
}

const PlanConfirmationDialogContext =
   createContext<PlanConfirmationDialogContextType>({
      groupToManage: null,
      handleClose: () => {},
      startPlan: async () => {},
      isMutating: false,
      updatedGroupPlanType: undefined,
   })

const CompanyPlanConfirmationDialog = ({
   handleClose,
   open,
   groupToManage,
}: Props) => {
   const initialStep = getInitialStep(groupToManage)

   const { trigger, isMutating, updatedGroupPlanType } = useStartPlanMutation(
      groupToManage.id
   )

   const startPlan = useCallback(
      async (planType: GroupPlanType) => {
         const planData: StartPlanData = {
            planType: planType,
            groupId: groupToManage.id,
         }
         await trigger(planData)
      },
      [groupToManage.id, trigger]
   )

   const providerValue = useMemo<PlanConfirmationDialogContextType>(
      () => ({
         groupToManage,
         handleClose,
         startPlan,
         isMutating,
         updatedGroupPlanType,
      }),
      [groupToManage, handleClose, isMutating, startPlan, updatedGroupPlanType]
   )

   return (
      <PlanConfirmationDialogContext.Provider value={providerValue}>
         <SteppedDialog
            key={open ? "open" : "closed"}
            bgcolor="#FCFCFC"
            handleClose={handleClose}
            open={open}
            views={views}
            initialStep={initialStep}
            disableFullScreen
            maxWidth={546}
         />
      </PlanConfirmationDialogContext.Provider>
   )
}

const getInitialStep = (groupToManage: GroupPresenter) => {
   if (!groupToManage.hasPlan()) {
      return views.findIndex(
         (view) => view.key === PlanConfirmationDialogKeys.SelectPlan
      )
   }

   if (groupToManage.plan.type === GroupPlanTypes.Trial) {
      return views.findIndex(
         (view) => view.key === PlanConfirmationDialogKeys.ConfirmSparksPlan
      )
   }

   const defaultPlanViewIndex = views.findIndex(
      (view) => view.key === PlanConfirmationDialogKeys.ConfirmSparksTrial
   )

   return defaultPlanViewIndex
}

export const usePlanConfirmationDialogContext = () => {
   const context = React.useContext(PlanConfirmationDialogContext)

   if (context === undefined) {
      throw new Error(
         "usePlanConfirmationDialog must be used within a PlanConfirmationDialogContext"
      )
   }

   return context
}

export const usePlanConfirmationDialog = () => {
   const stepper = useStepper<PlanConfirmationDialogKey>()
   const context = usePlanConfirmationDialogContext()

   const startPlanAndGoToSuccess = useCallback(
      async (planType: GroupPlanType) => {
         await context.startPlan(planType)
         stepper.goToStep(PlanConfirmationDialogKeys.Success)
      },
      [context, stepper]
   )
   return {
      stepper,
      startPlanAndGoToSuccess,
      ...context,
   }
}
export const usePlanConfirmationDialogStepper =
   useStepper<PlanConfirmationDialogKey>

export default CompanyPlanConfirmationDialog
