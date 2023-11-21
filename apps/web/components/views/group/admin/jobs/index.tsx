import { Box } from "@mui/material"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"

const JobsContent = () => {
   // Fetch ATS Data (suspense)
   const { groupPresenter } = useGroupFromState()

   return (
      <Box>
         {" "}
         This will be the Job section for {groupPresenter.universityName}{" "}
      </Box>
   )
}

export default JobsContent
