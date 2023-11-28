import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import SteppedDialog, {
   View,
} from "components/views/stepped-dialog/SteppedDialog"
import React, { createContext, useMemo } from "react"
import SelectPlanView from "./SelectPlanView"

type Props = {
   open: boolean
   handleClose: () => void
   groupToManage: GroupPresenter
}

const views = [
   {
      key: "select-plan",
      Component: SelectPlanView,
   },
   {
      key: "confirm-upgrade-to-sparks",
      Component: () => <div>Upgrade to Sparks</div>,
   },
   {
      key: "confirm-sparks-plan",
      Component: () => <div>Confirm Sparks Plan</div>,
   },
   {
      key: "confirm-sparks-trial",
      Component: () => <div>Confirm Sparks Trial</div>,
   },
   {
      key: "success",
      Component: () => <div>Success</div>,
   },
] as const satisfies View[]

export type Keys = (typeof views)[number]["key"]

type PlanConfirmationDialogContextType = {
   groupToManage: GroupPresenter
   handleClose: () => void
}

const PlanConfirmationDialogContext =
   createContext<PlanConfirmationDialogContextType>({
      groupToManage: null,
      handleClose: () => {},
   })

const CompanyPlanConfirmationDialog = ({
   handleClose,
   open,
   groupToManage,
}: Props) => {
   const initialStep = 0

   const providerValue = useMemo<PlanConfirmationDialogContextType>(
      () => ({
         groupToManage,
         handleClose,
      }),
      [groupToManage, handleClose]
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
         />
      </PlanConfirmationDialogContext.Provider>
   )
}

export const usePlanConfirmationDialog = () => {
   const context = React.useContext(PlanConfirmationDialogContext)

   if (context === undefined) {
      throw new Error(
         "usePlanConfirmationDialog must be used within a PlanConfirmationDialogContext"
      )
   }

   return context
}

export default CompanyPlanConfirmationDialog
