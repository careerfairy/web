import { Button, Collapse, Stack } from "@mui/material"
import { CreateOrEditCTAForm } from "./CreateOrEditCTAForm"

type Props = {
   isCreateCTAFormOpen: boolean
   setIsCreateCTAFormOpen: (value: boolean) => void
   hasCTA: boolean
}
export const CTACreationButton = ({
   isCreateCTAFormOpen,
   setIsCreateCTAFormOpen,
   hasCTA,
}: Props) => {
   const handleCloseForm = () => {
      setIsCreateCTAFormOpen(false)
   }

   if (!hasCTA) {
      return <CreateOrEditCTAForm onSuccess={handleCloseForm} />
   }

   return (
      <Stack>
         <Collapse unmountOnExit in={isCreateCTAFormOpen}>
            <CreateOrEditCTAForm
               onSuccess={handleCloseForm}
               onCancel={handleCloseForm}
            />
         </Collapse>
         {isCreateCTAFormOpen ? null : (
            <Button
               color="primary"
               variant="contained"
               fullWidth
               onClick={() => setIsCreateCTAFormOpen(true)}
            >
               Create call to action
            </Button>
         )}
      </Stack>
   )
}
