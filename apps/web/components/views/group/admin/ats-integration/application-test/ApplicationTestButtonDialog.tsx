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
            To finalise the ATS integration, you need to create a sample
            application from the CareerFairy platform in your ATS system. Click
            on {'"Next"'} to start the guided test application.
            <br />
            At the end of this process, you can delete the sample Candidate
            created in your ATS system.
            <p>
               <strong>
                  This validation is required to be able to associate Jobs to
                  your Live Streams.
               </strong>
            </p>
         </Typography>
      </Box>
   )
}

export default ApplicationTestButtonDialog
