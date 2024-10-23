import { DeniedPermissionsDialog } from "./DeniedPermissionsDialog"
import { PromptingForPermissionsDialog } from "./PromptingForPermissionsDialog"

export const CheckPermissions = () => {
   return (
      <>
         <PromptingForPermissionsDialog />
         <DeniedPermissionsDialog />
      </>
   )
}
