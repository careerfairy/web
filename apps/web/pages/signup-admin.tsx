import React from "react"
import SignupForm from "../components/views/signup/SignupForm"
import SignupLayout from "../layouts/SignupLayout"

const SignUp = () => {
   return (
      <SignupLayout>
         <SignupForm groupAdmin />
      </SignupLayout>
   )
}

export default SignUp
