import React, { FC } from "react"
import { useRouter } from "next/router"
import { useActionButtonContext } from "./ActionButtonProvider"
import { Button, Typography } from "@mui/material"
import styles from "./Styles"
import Link from "../../../../common/Link"
import { ActionButtonWrapper } from "./ActionButton"

const SignUpToWatchButton: FC = () => {
   const { asPath, pathname } = useRouter()

   const getSparksUtmParamsIfExist = () => {
      const isOnSparksFeed = pathname.includes("/sparks/[sparkId]")

      if (isOnSparksFeed) {
         return `&utm_source=careerfairy&utm_medium=sparks`
      }

      return ""
   }

   const { isFloating, isFixedToBottom } = useActionButtonContext()

   return (
      <ActionButtonWrapper isFloating={isFloating} isFixedToBottom={isFixedToBottom}>
         <Button
            id="register-button"
            color="primary"
            sx={styles.btn}
            variant={"contained"}
            fullWidth
            href={`/signup?absolutePath=${asPath}${getSparksUtmParamsIfExist()}`}
            component={Link}
            disableElevation
            data-testid="livestream-signup-watch-button"
            size={isFixedToBottom? "medium" : "large"}
         >
            Sign Up to Watch
         </Button>
         {isFloating || isFixedToBottom ? null : (
            <Typography sx={{ textAlign: "center", marginTop: 2 }}>
               Already have an account?{" "}
               <Link
                  color="inherit"
                  href={`/login?absolutePath=${asPath}${getSparksUtmParamsIfExist()}`}
               >
                  Log In
               </Link>
            </Typography>
         )}
      </ActionButtonWrapper>
   )
}

export default SignUpToWatchButton
