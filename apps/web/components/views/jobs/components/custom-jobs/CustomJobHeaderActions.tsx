import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Stack } from "@mui/material"
import { UserSaveJob } from "./header-actions/SaveJob"

export type CustomJobHeaderActionsProps = {
   customJob: CustomJob
   isAdmin?: boolean
}

export const CustomJobHeaderActions = ({
   customJob,
   isAdmin,
}: CustomJobHeaderActionsProps) => {
   return (
      <Stack direction={"row"} spacing={1}>
         {!isAdmin ? <UserSaveJob customJob={customJob} /> : null}
      </Stack>
   )
}
