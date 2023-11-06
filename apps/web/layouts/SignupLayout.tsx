import React, { FC } from "react"
import { PillsBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import SEO from "../components/util/SEO"
import { HeaderLogoWrapper } from "../materialUI"
import AuthLogo from "../components/views/common/logos/AuthLogo"
import { Typography } from "@mui/material"
import { sxStyles } from "../types/commonTypes"

const styles = sxStyles({
   footer: {
      fontWeight: 700,
      fontSize: "1.3em",
      padding: "40px 0 30px 0",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: "0.4em",
   },
})
const SignupLayout: FC<{
   children: React.ReactNode
}> = ({ children }) => {
   return (
      <PillsBackground>
         <SEO title="CareerFairy | Sign Up" />
         <HeaderLogoWrapper>
            <AuthLogo />
         </HeaderLogoWrapper>
         {children}
         <Typography sx={styles.footer}>Meet Your Future</Typography>
      </PillsBackground>
   )
}

export default SignupLayout
