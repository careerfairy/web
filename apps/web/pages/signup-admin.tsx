import React from "react"
import { RenderTitle } from "../components/views/signup/SignupForm"
import SignupLayout from "../layouts/SignupLayout"
import { Box, Container } from "@mui/material"
import SignUpAdminForm from "../components/views/signup/steps/SignUpAdminForm"

const SignUp = () => {
   return (
      <SignupLayout>
         <RenderTitle title={"Create your admin profile to start"} />
         <Container maxWidth="md">
            <Box p={3} mt={3}>
               <SignUpAdminForm />
            </Box>
         </Container>
      </SignupLayout>
   )
}

export default SignUp
