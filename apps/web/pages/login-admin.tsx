import React from "react"
import { MainLogo } from "../components/logos"
import { PillsBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { HeaderLogoWrapper } from "../materialUI"
import { sxStyles } from "../types/commonTypes"
import LogInForm from "../components/views/login/LoginForm"

const styles = sxStyles({
   logo: {
      margin: "20px 20px 0 20px",
   },
})

function LogInPage() {
   return (
      <PillsBackground>
         <HeaderLogoWrapper>
            <MainLogo sx={styles.logo} />
         </HeaderLogoWrapper>
         <LogInForm signupPagePath={"/signup-admin"} />
      </PillsBackground>
   )
}

export default LogInPage
