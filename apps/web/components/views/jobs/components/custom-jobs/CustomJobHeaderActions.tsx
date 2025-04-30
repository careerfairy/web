import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Stack } from "@mui/material"
import { UserSaveJob } from "./header-actions/SaveJob"

export type CustomJobHeaderActionsProps = {
   customJob: CustomJob
}

export const CustomJobHeaderActions = ({
   customJob,
}: CustomJobHeaderActionsProps) => {
   return (
      <Stack direction={"row"} spacing={1}>
         <UserSaveJob customJob={customJob} />
      </Stack>
   )
}
