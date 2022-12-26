import { Button, Typography } from "@mui/material"
import GenericDialog from "components/views/common/GenericDialog"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { useToggle } from "react-use"
import Pulse from "@stahl.luke/react-reveal/Pulse"

const ApplicationTestButtonDialog = () => {
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
               showCloseBtn={false}
               title={"Test Candidate Application"}
               onClose={toggleOpen}
            >
               <DialogBody />
            </GenericDialog>
         )}
      </>
   )
}

const DialogBody = () => {
   return (
      <>
         <Typography mb={2}>
            To finalise the ATS integration, you need to create a sample
            application from the CareerFairy platform in your ATS system.
            <br />
            At the end of this process, you can delete the sample Candidate
            created in your ATS system.
         </Typography>

         <Typography mb={3}>
            <strong>
               This validation is required to be able to associate Jobs to your
               Live Streams.
            </strong>
         </Typography>
      </>
   )
}

export default ApplicationTestButtonDialog
