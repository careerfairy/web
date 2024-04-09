import { Button, Stack } from "@mui/material"
import { CreateOrEditPollForm } from "./CreateOrEditPollForm"

type Props = {
   isCreatePollFormOpen: boolean
   setIsCreatePollFormOpen: (value: boolean) => void
   hasPolls: boolean
}
export const PollCreationButton = ({
   isCreatePollFormOpen,
   setIsCreatePollFormOpen,
   hasPolls,
}: Props) => {
   const shouldShowCreateForm = isCreatePollFormOpen || !hasPolls

   return (
      <Stack spacing={1}>
         {shouldShowCreateForm ? (
            <CreateOrEditPollForm
               onSuccess={() => setIsCreatePollFormOpen(false)}
            />
         ) : (
            <Button
               color="primary"
               variant="contained"
               fullWidth
               onClick={() => setIsCreatePollFormOpen(true)}
            >
               Create new poll
            </Button>
         )}
      </Stack>
   )
}
