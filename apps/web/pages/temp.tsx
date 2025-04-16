import { Box } from "@mui/material"
import { RegistrationSuccessAnimation } from "components/views/livestream-dialog/animations/registraton-success/RegistrationSuccessAnimation"
import { NextPage } from "next"

const TempPage: NextPage = () => {
   return (
      <Box
         minHeight="100vh"
         display="flex"
         justifyContent="center"
         alignItems="center"
      >
         <Box
            position="relative"
            border="1px solid red"
            overflow="hidden"
            width={900}
            height={900}
         >
            <RegistrationSuccessAnimation />
         </Box>
      </Box>
   )
}

export default TempPage
