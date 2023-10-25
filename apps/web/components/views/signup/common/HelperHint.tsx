import React from "react"
import { Box } from "@mui/material"
import Link from "next/link"
import { sxStyles } from "../../../../types/commonTypes"
import { useRouter } from "next/router"
const styles = sxStyles({
   submit: {
      margin: (theme) => theme.spacing(3, 0, 2),
   },
   resetEmail: {
      margin: "20px auto 0 auto",
      textAlign: "center",
   },
})

type Props = {
   groupAdmin?: boolean
}
const HelperHint = ({ groupAdmin }: Props) => {
   const loginPagePath = groupAdmin ? "/login-admin" : "/login"

   const {
      query: { absolutePath },
   } = useRouter()

   return (
      <>
         <Box sx={styles.resetEmail}>
            <div style={{ marginBottom: "5px" }}>
               Already part of the family?
            </div>
            <Link
               href={{
                  pathname: loginPagePath,
                  query: {
                     ...(absolutePath && {
                        absolutePath,
                     }),
                  },
               }}
            >
               Log in
            </Link>
         </Box>
         <Box sx={styles.resetEmail}>
            <div style={{ marginBottom: "5px" }}>
               Having issues signing up?
               <a
                  style={{ marginLeft: "5px" }}
                  href="mailto:maximilian@careerfairy.io"
               >
                  Let us know
               </a>
            </div>
         </Box>
      </>
   )
}

export default HelperHint
