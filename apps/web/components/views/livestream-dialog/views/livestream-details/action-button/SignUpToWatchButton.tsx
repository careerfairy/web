import React, { FC, useCallback } from "react"
import { useRouter } from "next/router"
import { useActionButtonContext } from "./ActionButtonProvider"
import { Button, Typography } from "@mui/material"
import styles from "./Styles"
import Link from "../../../../common/Link"
import { FloatingButtonWrapper } from "./ActionButton"

const SignUpToWatchButton: FC = () => {
   const { push, asPath, pathname } = useRouter()

   const redirectToSignUp = useCallback(() => {
      const isOnSparksFeed = pathname.includes("/sparks/[sparkId]")
      const utmParams = isOnSparksFeed
         ? { utm_source: "careerfairy", utm_medium: "sparks" }
         : null
      console.log(isOnSparksFeed, utmParams)
      return push({
         pathname: `/signup`,
         query: { absolutePath: asPath, ...utmParams },
      })
   }, [asPath, pathname, push])

   const { isFloating } = useActionButtonContext()

   return (
      <FloatingButtonWrapper isFloating={isFloating}>
         <Button
            id="register-button"
            color="primary"
            sx={styles.btn}
            variant={"contained"}
            fullWidth
            onClick={redirectToSignUp}
            disableElevation
            data-testid="livestream-signup-watch-button"
            size="large"
         >
            Sign Up to Watch
         </Button>
         {isFloating ? null : (
            <Typography sx={{ textAlign: "center", marginTop: 2 }}>
               Already have an account?{" "}
               <Link color="inherit" href={`/login?absolutePath=${asPath}`}>
                  Log In
               </Link>
            </Typography>
         )}
      </FloatingButtonWrapper>
   )
}

export default SignUpToWatchButton
