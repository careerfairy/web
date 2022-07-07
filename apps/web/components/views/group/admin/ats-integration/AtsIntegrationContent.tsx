import Header from "../Header"
import Box from "@mui/material/Box"
import { Button } from "@mui/material"
import { atsServiceInstance } from "../../../../../data/firebase/ATSService"
import { useSelector } from "react-redux"
import { groupSelector } from "../../../../../store/selectors/groupSelectors"
import { Group } from "@careerfairy/shared-lib/dist/groups"

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
   const group: Group = useSelector(groupSelector)

   const startLink = async () => {
      console.log(await atsServiceInstance.linkCompanyWithATS(group.groupId))
   }

   return (
      <Button variant="contained" onClick={startLink}>
         Associate new integrations with Merge
      </Button>
   )
}

export default AtsIntegrationContent
