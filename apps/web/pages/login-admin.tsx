import React from "react"
import LogInForm from "../components/views/login/LoginForm"
import LoginLayout from "../layouts/LoginLayout"

const LogInPage = () => (
   <LoginLayout>
      <LogInForm groupAdmin />
   </LoginLayout>
)

export default LogInPage
