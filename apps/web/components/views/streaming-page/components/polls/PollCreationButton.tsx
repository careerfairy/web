import { Button, Stack } from "@mui/material"
import { useState } from "react"
import { CreateOrEditPollForm } from "./CreateOrEditPollForm"
import { Collapse } from "@mui/material"

export const PollCreationButton = () => {
   const [isCreatePollOpen, setIsCreatePollOpen] = useState(true)

   return (
      <Stack spacing={3}>
         <Collapse unmountOnExit in={isCreatePollOpen}>
            <CreateOrEditPollForm />
         </Collapse>
         <Collapse unmountOnExit in={!isCreatePollOpen}>
            <Button
               color="primary"
               variant="contained"
               fullWidth
               onClick={() => setIsCreatePollOpen(true)}
            >
               Create new poll
            </Button>
         </Collapse>
      </Stack>
   )
}
