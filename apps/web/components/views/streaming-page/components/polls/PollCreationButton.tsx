import { Button, Collapse, Stack } from "@mui/material"
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

   const handleCloseForm = () => {
      setIsCreatePollFormOpen(false)
   }

   if (!hasPolls) {
      return <CreateOrEditPollForm onSuccess={handleCloseForm} />
   }

   return (
      <Stack spacing={1}>
         <Collapse in={isCreatePollFormOpen}>
            <CreateOrEditPollForm
               onSuccess={handleCloseForm}
               onCancel={handleCloseForm}
            />
         </Collapse>
         {shouldShowCreateForm ? null : (
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
