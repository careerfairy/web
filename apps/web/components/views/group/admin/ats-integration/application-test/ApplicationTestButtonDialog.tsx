import { Box, Button, Typography } from "@mui/material"
import GenericDialog from "components/views/common/GenericDialog"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { useToggle } from "react-use"

type Props = {
   groupId: string
   integrationId: string
}

const ApplicationTestButtonDialog = ({ groupId, integrationId }: Props) => {
   const [isOpen, toggleOpen] = useToggle(false)

   return (
      <>
         <Button
            variant={"contained"}
            onClick={toggleOpen}
            size={"small"}
            color={"warning"}
            endIcon={<ErrorOutlineIcon />}
         >
            Application Test
         </Button>
         {isOpen && (
            <GenericDialog
               title={"Test Candidate Application"}
               onClose={toggleOpen}
            >
               <DialogBody groupId={groupId} integrationId={integrationId} />
            </GenericDialog>
         )}
      </>
   )
}

const DialogBody = ({ groupId, integrationId }: Props) => {
   return (
      <Box>
         <Typography>
            To be sure everything is working fine with your integration, we{"'"}
            ll try to a apply a Candidate to a Job. You should delete the dummy
            Candidate created in your ATS system after this test is complete.
         </Typography>
      </Box>
   )
}

export default ApplicationTestButtonDialog
