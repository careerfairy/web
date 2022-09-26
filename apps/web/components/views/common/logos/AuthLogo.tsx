import React from "react"
import { MainLogo } from "../../../logos"
import { sxStyles } from "../../../../types/commonTypes"
const styles = sxStyles({
   logo: {
      margin: "20px 20px 0 20px",
   },
})

const AuthLogo = () => {
   return <MainLogo sx={styles.logo} />
}

export default AuthLogo
