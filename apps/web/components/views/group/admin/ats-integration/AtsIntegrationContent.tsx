import Header from "../Header"
import Box from "@mui/material/Box"
import { Button } from "@mui/material"

const AtsIntegrationContent = () => {
   return (
      <>
         <Header
            title={"Applicants Tracking System"}
            subtitle={"Manage your ATS integrations"}
         />
         <Box p={3}>
            <ConnectWithATSSystem />
         </Box>
      </>
   )
}

const ConnectWithATSSystem = () => {
   return (
      <Button variant="contained">Associate new integrations with Merge</Button>
   )
}

export default AtsIntegrationContent
