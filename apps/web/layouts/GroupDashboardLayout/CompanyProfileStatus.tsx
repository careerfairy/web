import { Group } from "@careerfairy/shared-lib/groups"
import { Status } from "./Status"

type Props = {
   group: Group
}

export const CompanyProfileStatus = ({ group }: Props) => {
   const companyProfileIncomplete = !group.publicProfile

   // Show warning status only when publicProfile is falsy (not published)
   if (companyProfileIncomplete) {
      return (
         <Status
            message={"Company profile setup is incomplete"}
            color={"warning"}
         />
      )
   }

   // If publicProfile is true, don't show any status
   return null
}
