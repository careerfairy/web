import { Box, Button, Typography } from "@mui/material"
import GenericDialog from "components/views/common/GenericDialog"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { useToggle } from "react-use"
import Pulse from "@stahl.luke/react-reveal/Pulse"

type Props = {
   groupId: string
   integrationId: string
}

const ApplicationTestButtonDialog = ({ groupId, integrationId }: Props) => {
   const [isOpen, toggleOpen] = useToggle(false)

   return (
      <>
         <Pulse count={4} duration={1500} appear when={!isOpen}>
            <Button
               variant={"contained"}
               onClick={toggleOpen}
               size={"small"}
               color={"warning"}
               endIcon={<ErrorOutlineIcon />}
            >
               Application Test
            </Button>
         </Pulse>
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
            <p>
               <strong>
                  This is required so that you can associate Jobs with Live
                  Streams.
               </strong>
            </p>
         </Typography>
      </Box>
   )
}

export default ApplicationTestButtonDialog
