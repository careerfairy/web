import { Button, Stack } from "@mui/material"
import { CreateOrEditPollForm } from "./CreateOrEditPollForm"
import { Collapse } from "@mui/material"

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
         <Collapse unmountOnExit in={!shouldShowCreateForm}>
            <Button
               color="primary"
               variant="contained"
               fullWidth
               onClick={() => setIsCreatePollFormOpen(true)}
            >
               Create new poll
            </Button>
         </Collapse>
         <Collapse unmountOnExit in={shouldShowCreateForm}>
            <CreateOrEditPollForm
               onSuccess={() => setIsCreatePollFormOpen(false)}
            />
         </Collapse>
      </Stack>
   )
}
