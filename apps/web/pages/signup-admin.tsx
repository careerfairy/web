import React from "react"
import SignupForm from "../components/views/signup/SignupForm"

const SignUp = () => {
   return <SignupForm isForAdmin signupRedirectPath={"/profile/groups"} />
}

export default SignUp
